"use server";

import { createApprovalAction, updateApprovalAction } from "@/lib/actions/approval/approvalAction";
import { getApprovalOrdersByApprovalId, updateApprovalOrder } from "@/lib/actions/approval/approvalOrder";
import { getMasterStatus } from "@/lib/actions/approval/masterStatus";
import { MasterStatusType } from "@/schemas/approval/masterStatusSchema";
import {
    approvalActionCreateSchema,
    ApprovalActionUpsertInput,
    isUpdateInput
} from "@/schemas/approval/approvalActionSchema";

export async function upsertApprovalAction( data: ApprovalActionUpsertInput ) {
    try {
        if (isUpdateInput(data)) {
            const res = await updateApprovalAction(data.id, data);
            return res;
        } else {
            const payload = {
                ...approvalActionCreateSchema.parse(data),
                order_id: data.order_id || undefined,
                reviewer_id: data.reviewer_id || undefined
            };

            const resStatus = await getMasterStatus()
            if (!resStatus.ok) {
                return { ok: false as const, error: "ステータスマスタを取得できません" };
            }
            const status = resStatus.data

            const res = await createApprovalAction(payload);
            if (res.ok) {
                try {
                    if(res.data.action === "approve") {
                        await approvalProcess(status, res.data)
                    }
                    else if(res.data.action === "reject") {
                        await rejectProcess(status, res.data)
                    }
                    else if(res.data.action === "return") {
                        await returnProcess(status, res.data)
                    }
                    else if(res.data.action === "resubmit") {
                        if(!data.order_id) return { ok: false as const, error: "承認者IDを取得できません" }
                        await resubmitProcess(status, res.data, data.order_id)
                    }
                    // TODO ファイル添付

                    // TODO 通知
                    // await notifyNewApprovalAction(payload);
                // } catch (notifyError) {
                //     console.error("notifyNewApprovalAction failed", notifyError);
                } catch (e) {
                    console.error("upsertApprovalAction failed", e);
                }
            }

            return res;
        }
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 承認処理
async function approvalProcess(status: MasterStatusType[], data: any) {
    if(!data.order_id) return { ok: false as const, error: "承認者IDを取得できません" }
    const approved_status_id = status?.find((s) => s.code === "approved")?.id
    if(!approved_status_id) return { ok: false as const, error: "承認ステータスを取得できません" }
    await updateApprovalOrder(data.order_id, { status_id: approved_status_id });

    const orders = await getApprovalOrdersByApprovalId(data.approval_id);
    if (!orders.ok) {
        console.error("getApprovalOrdersByApprovalId failed", orders.error);
    }
    if (orders.data) {
        // *** 次の人に承認ターン移動 *** //
        const nextIndex = orders.data.sort((a, b) => a.sequence - b.sequence).findIndex((o) => o.id === data.order_id)+1;
        const nextOrder = orders.data[nextIndex];
        if (nextOrder) {
            const pending_status_id = status?.find((s) => s.code === "pending")?.id
            if(!pending_status_id) return { ok: false as const, error: "稟議中ステータスを取得できません" }
            await updateApprovalOrder(nextOrder.id, { status_id: pending_status_id });
        } else {
            // *** TODO 最終承認者処理 *** //
            // *** TODO 最終承認者処理 *** //
            // *** TODO 最終承認者処理 *** //
        }
    }
}

// 否認処理
async function rejectProcess(status: MasterStatusType[], data: any) {
    if(!data.order_id) return { ok: false as const, error: "承認者IDを取得できません" }
    const rejected_status_id = status?.find((s) => s.code === "rejected")?.id
    if(!rejected_status_id) return { ok: false as const, error: "承認ステータスを取得できません" }
    await updateApprovalOrder(data.order_id, { status_id: rejected_status_id });

    // *** 以降の人を取り消しステータスに更新 *** //
    const orders = await getApprovalOrdersByApprovalId(data.approval_id);
    if (orders.data) {
        const nextIndex = orders.data.sort((a, b) => a.sequence - b.sequence).findIndex((o) => o.id === data.order_id)+1;
        const afterOrders = orders.data.slice(nextIndex);
        if (afterOrders) {
            const cancelled_status_id = status?.find((s) => s.code === "cancelled")?.id
            if(!cancelled_status_id) return { ok: false as const, error: "取消ステータスを取得できません" }
            Promise.all(afterOrders.map((o) => updateApprovalOrder(o.id, { status_id: cancelled_status_id })));
        }
    }
}

// 差し戻し処理
async function returnProcess(status: MasterStatusType[], data: any) {
    if(!data.order_id) return { ok: false as const, error: "承認者IDを取得できません" }
    const return_status_id = status?.find((s) => s.code === "return")?.id
    if(!return_status_id) return { ok: false as const, error: "差し戻しステータスを取得できません" }
    await updateApprovalOrder(data.order_id, { status_id: return_status_id });
}

// 差し戻し返答処理
async function resubmitProcess(status: MasterStatusType[], data: any, order_id: string) {
    if(!data.order_id) return { ok: false as const, error: "承認者IDを取得できません" }
    const pending_status_id = status?.find((s) => s.code === "pending")?.id
    if(!pending_status_id) return { ok: false as const, error: "決裁中ステータスを取得できません" }
    await updateApprovalOrder(order_id, { status_id: pending_status_id });
}
