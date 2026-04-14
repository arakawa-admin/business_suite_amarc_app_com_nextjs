import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalActionAttachmentType,
    ApprovalActionAttachmentCreateInput,
    ApprovalActionAttachmentUpdatePayload,
} from "@/schemas/approval/approvalActionAttachmentSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalActionAttachments(): Promise<FetchResult<ApprovalActionAttachmentType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_action_attachments")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalActionAttachmentById(id: string): Promise<FetchResult<ApprovalActionAttachmentType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_action_attachments")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalActionAttachment(
    data: ApprovalActionAttachmentCreateInput
): Promise<FetchResult<ApprovalActionAttachmentType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { data: created, error } = await approval
        .from("approval_action_attachments")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalActionAttachmentById(
    id: string,
    data: ApprovalActionAttachmentUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("approval_action_attachments")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
