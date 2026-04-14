import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalRevisionAttachmentType,
    ApprovalRevisionAttachmentCreateInput,
    ApprovalRevisionAttachmentUpdatePayload,
} from "@/schemas/approval/approvalRevisionAttachmentSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalRevisionAttachments(): Promise<FetchResult<ApprovalRevisionAttachmentType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_revision_attachments")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalRevisionAttachmentById(id: string): Promise<FetchResult<ApprovalRevisionAttachmentType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_revision_attachments")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalRevisionAttachment(
    data: ApprovalRevisionAttachmentCreateInput
): Promise<FetchResult<ApprovalRevisionAttachmentType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { data: created, error } = await approval
        .from("approval_revision_attachments")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalRevisionAttachmentById(
    id: string,
    data: ApprovalRevisionAttachmentUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("approval_revision_attachments")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
