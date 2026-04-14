import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalDraftAttachmentType,
    ApprovalDraftAttachmentCreateInput,
    ApprovalDraftAttachmentUpdatePayload,
} from "@/schemas/approval/approvalDraftAttachmentSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalDraftAttachments(): Promise<FetchResult<ApprovalDraftAttachmentType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_draft_attachments")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalDraftAttachmentsByDraftId(id: string): Promise<FetchResult<ApprovalDraftAttachmentType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_draft_attachments")
        .select(`*`)
        .eq("approval_draft_id", id)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalDraftAttachmentById(id: string): Promise<FetchResult<ApprovalDraftAttachmentType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_draft_attachments")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalDraftAttachment(
    data: ApprovalDraftAttachmentCreateInput
): Promise<FetchResult<ApprovalDraftAttachmentType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { data: created, error } = await approval
        .from("approval_draft_attachments")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalDraftAttachmentById(
    id: string,
    data: ApprovalDraftAttachmentUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("approval_draft_attachments")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

export async function deleteApprovalDraftAttachmentById(
    id: string
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { error } = await approval.from("approval_draft_attachments").delete().eq("id", id);
    if (error) {
        return { ok: false, error: `DB delete failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

export async function deleteApprovalDraftAttachmentByAttachmentId(
    id: string
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { error } = await approval.from("approval_draft_attachments").delete().eq("id", id);
    if (error) {
        return { ok: false, error: `DB delete failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
