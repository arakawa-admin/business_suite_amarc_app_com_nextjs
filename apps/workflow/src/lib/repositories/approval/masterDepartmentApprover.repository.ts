import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterDepartmentApproverType,
    MasterDepartmentApproverCreateInput,
    MasterDepartmentApproverUpdatePayload,
} from "@/schemas/approval/masterDepartmentApproverSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterDepartmentApprovers(): Promise<FetchResult<MasterDepartmentApproverType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_department_approvers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}


export async function fetchMasterDepartmentApproversByDeptId(deptId: string): Promise<FetchResult<MasterDepartmentApproverType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_department_approvers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        .eq("department_id", deptId)
        .order("sequence")
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterDepartmentApproverById(id: string): Promise<FetchResult<MasterDepartmentApproverType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_department_approvers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterDepartmentApprover(
    data: MasterDepartmentApproverCreateInput
): Promise<FetchResult<MasterDepartmentApproverType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data: created, error } = await approval
        .from("master_department_approvers")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterDepartmentApproverById(
    id: string,
    data: MasterDepartmentApproverUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("master_department_approvers")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterDepartmentApproverInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { error } = await approval
        .from("master_department_approvers")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
