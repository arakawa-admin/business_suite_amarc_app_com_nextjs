import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalOrderType,
    ApprovalOrderCreateInput,
    ApprovalOrderUpdatePayload,
} from "@/schemas/approval/approvalOrderSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalOrders(): Promise<FetchResult<ApprovalOrderType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_orders")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            status:master_status!fk_status(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalOrdersByApprovalId(approvalId: string): Promise<FetchResult<ApprovalOrderType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_orders")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            status:master_status!fk_status(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        .eq("approval_id", approvalId)
        .order("sequence")
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalOrderById(id: string): Promise<FetchResult<ApprovalOrderType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_orders")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            status:master_status!fk_status(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalOrder(
    data: ApprovalOrderCreateInput
): Promise<FetchResult<ApprovalOrderType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data: created, error } = await approval
        .from("approval_orders")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalOrderById(
    id: string,
    data: ApprovalOrderUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("approval_orders")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
