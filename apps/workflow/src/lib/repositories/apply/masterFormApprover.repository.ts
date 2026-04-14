import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterFormApproverType,
    MasterFormApproverCreateInput,
    MasterFormApproverUpdatePayload,
} from "@/schemas/apply/masterFormApproverSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterFormApprovers(): Promise<FetchResult<MasterFormApproverType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("master_form_approvers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            apply_form:apply_forms!fk_apply_form(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}


export async function fetchMasterFormApproversByDeptIdAndFormId(deptId: string, formId: string): Promise<FetchResult<MasterFormApproverType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");
    const { data, error } = await apply
        .from("master_form_approvers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            apply_form:apply_forms!fk_apply_form(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        .eq("department_id", deptId)
        .eq("apply_form_id", formId)
        .order("sequence")
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterFormApproverById(id: string): Promise<FetchResult<MasterFormApproverType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("master_form_approvers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            apply_form:apply_forms!fk_apply_form(*),
            approver_user:master_staffs!fk_approver_user(*)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterFormApprover(
    data: MasterFormApproverCreateInput
): Promise<FetchResult<MasterFormApproverType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data: created, error } = await apply
        .from("master_form_approvers")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterFormApproverById(
    id: string,
    data: MasterFormApproverUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("master_form_approvers")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterFormApproverInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { error } = await apply
        .from("master_form_approvers")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
