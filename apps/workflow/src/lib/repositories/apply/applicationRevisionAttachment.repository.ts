import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApplicationRevisionAttachmentType,
    ApplicationRevisionAttachmentCreateInput,
    ApplicationRevisionAttachmentUpdatePayload,
} from "@/schemas/apply/applicationRevisionAttachmentSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApplicationRevisionAttachments(): Promise<FetchResult<ApplicationRevisionAttachmentType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("application_revision_attachments")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplicationRevisionAttachmentById(id: string): Promise<FetchResult<ApplicationRevisionAttachmentType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("application_revision_attachments")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApplicationRevisionAttachment(
    data: ApplicationRevisionAttachmentCreateInput
): Promise<FetchResult<ApplicationRevisionAttachmentType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");
    const { data: created, error } = await apply
        .from("application_revision_attachments")
        .insert(data)
        .select("*")
        .single();

    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApplicationRevisionAttachmentById(
    id: string,
    data: ApplicationRevisionAttachmentUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("application_revision_attachments")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
