"use server";

import { getApplicationById } from "@/lib/actions/apply/application";
import { postRevisionAttachments } from "@/services/apply/applicationAttachmentService";
import type { AttachmentCreateInput } from "@/schemas/apply/attachmentSchema";

export async function submitRevisionAttachments(args: {
    application_id: string;
    files: AttachmentCreateInput[];
}) {
    const { data: application } = await getApplicationById(args.application_id);
    if (!application) throw new Error("申請情報の取得に失敗しました");

    const { ok, data: attachments } = await postRevisionAttachments(args.files, application.current_revision_id);
    if (!ok) throw new Error("添付ファイルの保存処理に失敗しました");

    return { ok: true as const, data: attachments };
}
