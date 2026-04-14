"use server";

import { createAttachment } from "@/lib/actions/approval/attachment";
import { createApprovalRevisionAttachment } from "@/lib/actions/approval/approvalRevisionAttachment";
import { createApprovalActionAttachment } from "@/lib/actions/approval/approvalActionAttachment";
import { createApprovalDraftAttachment, deleteAttachmentByAttachmentId } from "@/lib/actions/approval/approvalDraftAttachment";
import { deleteApprovalDraft } from "@/lib/actions/approval/approvalDraft";

import { AttachmentCreateInput } from '@/schemas/approval/attachmentSchema';
import { ApprovalDraftType } from "@/schemas/approval/approvalDraftSchema";
import { deleteDraftAttachment } from "@/services/approval/approvalDraftService";

export async function finalizeDraftAttachments({
    files,
    current_revision_id,
    profile_id,
    draft,
    removedAttachmentIds=[],
}: {
    files: AttachmentCreateInput[],
    current_revision_id: string,
    profile_id: string,
    draft?: ApprovalDraftType,
    removedAttachmentIds: string[]
}) {
    try {
        // *** 新規追加分
        // 添付リビジョン作成
        const { ok } = await postRevisionAttachments(
            files,
            current_revision_id,
            profile_id
        );
        if(!ok) throw new Error("添付ファイルの保存処理に失敗しました");

        // *** 下書き分
        // removedAttachmentIds　は実態ファイルをR2からも消す
        removedAttachmentIds.map((id) => {
            (async () => {
                const { ok, error: delAttachmentErr } = await deleteDraftAttachment(id)
                if (!ok) throw new Error(delAttachmentErr);
            })();
        });

        // removedAttachmentIds になければ
        // draft_attachments table　から　revision_attachments table　に変更
        if (draft?.draft_attachments) {
            const moveDraftAttachments = (draft.draft_attachments ?? [])
                                        .filter((x) => !removedAttachmentIds.includes(x.attachment_id));
            moveDraftAttachments.map((da) => {
                (async () => {
                    const res = await createApprovalRevisionAttachment({
                        approval_revision_id: current_revision_id,
                        attachment_id: da.attachment_id,
                        sort_order: da.sort_order,
                        added_by: da.added_by,
                        added_at: da.added_at
                    });
                    if (!res.ok) throw new Error(`Failed: ${res}`);

                    const { ok, error: delAttachmentErr } = await deleteAttachmentByAttachmentId(da.attachment_id)
                    if (!ok) throw new Error(delAttachmentErr);
                })()
            })
        }

        // delete from approval_draft table
        if (draft?.id) {
            const { ok: delDraftOk, error: delDraftErr } = await deleteApprovalDraft(draft.id);
            if (!delDraftOk) throw new Error(delDraftErr);
        }

        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}



export async function postRevisionAttachments (
    files: AttachmentCreateInput[],
    approval_revision_id: string,
    added_by: string
) {
    try{
        await Promise.all(
            files.map((file, idx) => {
                (async () => {
                    if(!added_by) throw new Error("ユーザ情報の取得に失敗しました");
                    const res = await createAttachment(file);
                    if (!res.ok) throw new Error(`Failed: ${res}`);
                    const revisionRes = await createApprovalRevisionAttachment({
                        approval_revision_id,
                        attachment_id: res.data.id,
                        sort_order: idx+1,
                        added_by: added_by,
                        added_at: new Date()
                    })
                    if (!revisionRes.ok) throw new Error(`Failed: ${revisionRes}`);
                })()
            })
        );
        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function postActionAttachments (
    files: AttachmentCreateInput[],
    approval_action_id: string,
    added_by: string
) {
    await Promise.all(
        files.map((file, idx) => {
            (async () => {
                if(!added_by) throw new Error("ユーザ情報の取得に失敗しました");
                const res = await createAttachment(file);
                if (!res.ok) throw new Error(`Failed: ${res}`);
                const actionRes = await createApprovalActionAttachment({
                    approval_action_id,
                    attachment_id: res.data.id,
                    sort_order: idx+1,
                    added_by: added_by,
                    added_at: new Date()
                })
                if (!actionRes.ok) throw new Error(`Failed: ${actionRes}`);
            })()
        })
    );
}


export async function postDraftAttachments (
    files: AttachmentCreateInput[],
    approval_draft_id: string,
    added_by: string
) {
    await Promise.all(
        files.map((file, idx) => {
            (async () => {
                if(!added_by) throw new Error("ユーザ情報の取得に失敗しました");
                const res = await createAttachment(file);
                if (!res.ok) throw new Error(`Failed: ${res}`);
                const actionRes = await createApprovalDraftAttachment({
                    approval_draft_id,
                    attachment_id: res.data.id,
                    sort_order: idx+1,
                    added_by: added_by,
                    added_at: new Date()
                })
                if (!actionRes.ok) throw new Error(`Failed: ${actionRes}`);
            })()
        })
    );
}
