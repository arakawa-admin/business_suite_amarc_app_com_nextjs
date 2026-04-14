"use server";

import { createAttachment } from "@/lib/actions/apply/attachment";
import { createApplicationRevisionAttachment } from "@/lib/actions/apply/applicationRevisionAttachment";

import { AttachmentCreateInput } from '@/schemas/apply/attachmentSchema';

export async function postRevisionAttachments (
    files: AttachmentCreateInput[],
    application_revision_id: string,
) {
    try{
        const created = await Promise.all(
            files.map(async(file, idx) => {
                const { label, ...rest } = file;
                const res = await createAttachment(rest);
                if (!res.ok) throw new Error(`Failed: ${res}`);
                const revisionRes = await createApplicationRevisionAttachment({
                    application_revision_id,
                    attachment_id: res.data.id,
                    sort_order: idx+1,
                    created_at: new Date(),
                    label: label ?? "",
                })
                if (!revisionRes.ok) throw new Error(`Failed: ${revisionRes}`);
                return {
                    // attachment: res.data,
                    revision_attachment_id: revisionRes.data.id,
                    // attachment_id: res.data.id,
                    // label: label ?? "",
                    // sort_order: idx + 1,
                };
            })
        );
        return { ok: true as const, data: created };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
