import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalDraftType,
    ApprovalDraftCreateInput,
    ApprovalDraftUpdatePayload,
} from "@/schemas/approval/approvalDraftSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalDrafts(): Promise<FetchResult<ApprovalDraftType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_drafts")
        .select(`
            *,
            owner_user:master_staffs!fk_owner_user(*),
            draft_attachments:approval_draft_attachments(
                *,
                added_user:master_staffs!fk_add_user(*),
                attachment:attachments!fk_attachment(
                    *,
                    uploader:master_staffs!fk_uploader(*)
                )
            )
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}


export async function fetchApprovalDraftsByOwnerId(ownerId: string): Promise<FetchResult<ApprovalDraftType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_drafts")
        .select(`
            *,
            owner_user:master_staffs!fk_owner(*),
            draft_attachments:approval_draft_attachments(
                *,
                added_user:master_staffs!fk_add_user(*),
                attachment:attachments!fk_attachment(
                    *,
                    uploader:master_staffs!fk_uploader(*)
                )
            )
        `)
        .eq("owner_user_id", ownerId)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalDraftById(id: string): Promise<FetchResult<ApprovalDraftType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_drafts")
        .select(`
            *,
            owner_user:master_staffs!fk_owner(*),
            draft_attachments:approval_draft_attachments(
                *,
                added_user:master_staffs!fk_add_user(*),
                attachment:attachments!fk_attachment(
                    *,
                    uploader:master_staffs!fk_uploader(*)
                )
            )
        `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalDraft(
    data: ApprovalDraftCreateInput
): Promise<FetchResult<ApprovalDraftType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { data: created, error } = await approval
        .from("approval_drafts")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalDraftById(
    id: string,
    data: ApprovalDraftUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const { error } = await approval
        .from("approval_drafts")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

export async function deleteApprovalDraftById(
    id: string
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { error } = await approval.from("approval_drafts").delete().eq("id", id);
    if (error) {
        return { ok: false, error: `DB delete failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
