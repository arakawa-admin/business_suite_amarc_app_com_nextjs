import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalActionType,
    ApprovalActionCreateInput,
    ApprovalActionUpdatePayload,
} from "@/schemas/approval/approvalActionSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalActions(): Promise<FetchResult<ApprovalActionType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_actions")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            actor_user:master_staffs!fk_actor_user(*)
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalActionById(id: string): Promise<FetchResult<ApprovalActionType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_actions")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            actor_user:master_staffs!fk_actor_user(*)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalAction(
    data: ApprovalActionCreateInput
): Promise<FetchResult<ApprovalActionType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { data: created, error } = await approval
        .from("approval_actions")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalActionById(
    id: string,
    data: ApprovalActionUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("approval_actions")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

export async function deleteApprovalActionById(
    id: string
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { error } = await approval.from("approval_actions").delete().eq("id", id);
    if (error) {
        return { ok: false, error: `DB delete failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
