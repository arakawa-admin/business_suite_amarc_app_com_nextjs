"use server";

import { getApprovalById, createApproval, updateApproval } from "@/lib/actions/approval/approval";

import {
    // ApprovalUpsertInput,
    approvalCreateSchema,
    ApprovalWithRevisionUpsertInput,
    isUpdateWithRevisionInput } from "@/schemas/approval/approvalSchema";

import { approvalRevisionCreateSchema } from "@/schemas/approval/approvalRevisionSchema";
import { createApprovalRevision } from "@/lib/actions/approval/approvalRevision";

import { getMasterStatusByCode } from "@/lib/actions/approval/masterStatus";
import { getMasterDepartmentApproversByDeptId } from "@/lib/actions/approval/masterDepartmentApprover";
import { createApprovalOrder } from "@/lib/actions/approval/approvalOrder";

import { getMasterDepartmentReviewersByDeptId } from "@/lib/actions/approval/masterDepartmentReviewer";
import { createApprovalReviewer } from "@/lib/actions/approval/approvalReviewer";

import { getApprovalRevisionById } from "@/lib/actions/approval/approvalRevision"

export async function upsertApproval( data: ApprovalWithRevisionUpsertInput ) {
    try {
        if (isUpdateWithRevisionInput(data)) {
            // ** 改訂登録 ** //
            if(!data.current_revision_id) return { ok: false as const, error: "カレントリビジョンを取得できません" }
            const currentRevision = await getApprovalRevisionById(data.current_revision_id);
            if(!currentRevision.ok) return { ok: false as const, error: "カレントリビジョンを取得できません" }
            const { id: _id, ...rest } = data;
            const revisionPayload = approvalRevisionCreateSchema.parse({
                ...rest,
                round: currentRevision.data.round + 1,
                approval_id: data.id,
                snapshot_at: new Date(),
                snapshot_by: data.author_id,
            });
            const revisionRes = await createApprovalRevision(revisionPayload);
            // カレント リビジョン登録
            if(!revisionRes.ok) return { ok: false as const, error: "カレントリビジョンを更新できませんでした" }
            if(!data.id) return { ok: false as const, error: "稟議IDを取得できませんでした" }

            const res = await updateApproval(data.id, { current_revision_id: revisionRes.data.id });
            return res;
        } else {
            const initial_status_id = await getMasterStatusByCode("pending").then((res) => res.data?.id)
            if(!initial_status_id) return { ok: false as const, error: "初期ステータスを取得できません" }
            const other_status_id = await getMasterStatusByCode("waiting").then((res) => res.data?.id)
            if(!other_status_id) return { ok: false as const, error: "待機ステータスを取得できません" }

            const payload = {
                ...approvalCreateSchema.parse(data),
                serial_no: `${Date.now()}`, // TODO: 稟議書No.自動生成
                status_id: initial_status_id,
            };

            const res = await createApproval(payload);
            const createdApproval = res.data
            if(!createdApproval) return { ok: false as const, error: "稟議書の作成に失敗しました" }
            if (res.ok) {
                try {
                    // ** 改訂登録 ** //
                    const revisionPayload = approvalRevisionCreateSchema.parse({
                        ...data,
                        approval_id: createdApproval.id,
                        round: 1,
                        snapshot_at: new Date(),
                        snapshot_by: createdApproval.author_id,
                    });
                    const revisionRes = await createApprovalRevision(revisionPayload);
                    // カレント リビジョン登録
                    if(createdApproval && revisionRes.ok) {
                        await updateApproval(createdApproval.id, { current_revision_id: revisionRes.data.id });
                    }


                    // ** 承認者登録 ** //
                    const { data: approvers } = await getMasterDepartmentApproversByDeptId(data.department_id);
                    if(!approvers) return { ok: false as const, error: "承認者を取得できません" }

                    approvers?.map(async (approver, i) => {
                        await createApprovalOrder({
                            approval_id: res.data.id,
                            approver_user_id: approver.approver_user_id,
                            sequence: approver.sequence,
                            status_id: i==0 ? initial_status_id : other_status_id,
                        })
                    })


                    // ** 回議者登録 ** //
                    const { data: reviewers } = await getMasterDepartmentReviewersByDeptId(data.department_id);
                    if(!reviewers) return { ok: false as const, error: "回議者を取得できません" }

                    reviewers?.map(async (reviewer) => {
                        await createApprovalReviewer({
                            approval_id: res.data.id,
                            reviewer_user_id: reviewer.reviewer_user_id,
                            is_commented: false,
                        })
                    })



                    // TODO 通知
                    // await notifyNewApproval(payload);
                } catch (notifyError) {
                    console.error("notifyNewApproval failed", notifyError);
                }
            }

            const approval = await getApprovalById(createdApproval.id);
            return { ok: true as const, data: approval.data };
        }
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
