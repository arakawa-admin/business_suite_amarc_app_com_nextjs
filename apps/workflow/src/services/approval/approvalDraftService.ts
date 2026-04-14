"use server";

// import { createClient } from "@supabase-shared/server";
import { r2 } from "@/lib/cloudflare/storage/r2.server"; // サーバ専用に分離推奨
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { getApprovalDraftById, deleteApprovalDraft } from "@/lib/actions/approval/approvalDraft";
import { getAttachmentById, deleteAttachment } from "@/lib/actions/approval/attachment";

import { AttachmentType } from "@/schemas/approval/attachmentSchema";

export async function deleteDraftWithAttachments( draftId: string ) {
    try {
        // 1) 取得
        const { data: draft, error, ok } = await getApprovalDraftById(draftId);
        if (!ok) throw new Error(error);

        // delete attachment and R2
        if(draft?.draft_attachments) {
            const attachments = (draft.draft_attachments ?? []).map((x) => x.attachment).filter((x): x is AttachmentType => x != null);
            attachments.map((x) => {
                (async () => {
                    const { ok, error: delAttachmentErr } = await deleteDraftAttachment(x.id)
                    if (!ok) throw new Error(delAttachmentErr);
                })();
            });
        }

        // delete draft
        const { ok: delDraftOk, error: delDraftErr } = await deleteApprovalDraft(draftId);
        if (!delDraftOk) throw new Error(delDraftErr);

        return { ok: true, data: undefined };
    } catch (error: any) {
        return { ok: false, error: `approval draft delete failed: ${error.code} ${error.message}` };
    }
}



export async function deleteDraftAttachment(id: string) {
    // const supabase = await createClient();
    // const approval = supabase.schema("approval");

    // 1) 取得
    const { data: att, error } = await getAttachmentById(id);
    if (error || !att)
        return { ok: false, error: `not found` };

    // 2) 権限チェック（例：アップロード者のみ削除OK）
    // auth.uid() と staff_id の紐付け設計に合わせてここを実装
    // ここでは省略（あなたのmaster_login_users設計次第）

    // 3) 参照チェック（例：どこかに紐付いてたら削除禁止 or まず紐付け解除）
    // const [{ count: revCount }, { count: actCount }, { count: draftCount }] =
    //     await Promise.all([
    //         approval
    //             .from("approval_revision_attachments")
    //             .select("attachment_id", { count: "exact", head: true })
    //             .eq("attachment_id", att.id),
    //         approval
    //             .from("approval_action_attachments")
    //             .select("attachment_id", { count: "exact", head: true })
    //             .eq("attachment_id", att.id),
    //         approval
    //             .from("approval_draft_attachments")
    //             .select("attachment_id", { count: "exact", head: true })
    //             .eq("attachment_id", att.id),
    //     ]);

    // const totalRef = (revCount ?? 0) + (actCount ?? 0) + (draftCount ?? 0);
    // if (totalRef > 0) {
    //     return { ok: false, error: `still referenced: ${totalRef}` };
    // }

    // 4) R2削除（本体 + thumbnail）
    const bucket = att.bucket; // or env default
    await r2.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: att.storage_key }),
    );
    if (att.thumbnail_key) {
        await r2.send(
            new DeleteObjectCommand({ Bucket: bucket, Key: att.thumbnail_key }),
        );
    }

    // 5) DB削除
    const { ok, error: delAttachmentErr } = await deleteAttachment(att.id);

    if (!ok)
        return { ok: false, error: `approval draft delete failed: ${delAttachmentErr.code} ${delAttachmentErr}` };

    return { ok: true, data: undefined };
}

