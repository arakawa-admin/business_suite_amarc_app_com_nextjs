import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    AttachmentType,
    AttachmentCreateInput,
    AttachmentUpdatePayload,
} from "@/schemas/apply/attachmentSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchAttachments(): Promise<FetchResult<AttachmentType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("attachments")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchAttachmentById(id: string): Promise<FetchResult<AttachmentType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("attachments")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertAttachment(
    data: AttachmentCreateInput
): Promise<FetchResult<AttachmentType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");
    const { data: created, error } = await apply
        .from("attachments")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateAttachmentById(
    id: string,
    data: AttachmentUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("attachments")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

export async function deleteAttachmentById(
    id: string
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");
    const { error } = await apply.from("attachments").delete().eq("id", id);
    if (error) {
        return { ok: false, error: `DB delete failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
