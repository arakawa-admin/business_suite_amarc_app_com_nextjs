import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterDepartmentReviewerType,
    MasterDepartmentReviewerCreateInput,
    MasterDepartmentReviewerUpdatePayload,
} from "@/schemas/approval/masterDepartmentReviewerSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterDepartmentReviewers(): Promise<FetchResult<MasterDepartmentReviewerType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_department_reviewers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            reviewer_user:master_staffs!fk_reviewer_user(*)
        `);

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterDepartmentReviewersByDeptId(deptId: string): Promise<FetchResult<MasterDepartmentReviewerType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_department_reviewers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            reviewer_user:master_staffs!fk_reviewer_user(*)
        `)
        .eq("department_id", deptId)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterDepartmentReviewerById(id: string): Promise<FetchResult<MasterDepartmentReviewerType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_department_reviewers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            reviewer_user:master_staffs!fk_reviewer_user(*)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterDepartmentReviewer(
    data: MasterDepartmentReviewerCreateInput
): Promise<FetchResult<MasterDepartmentReviewerType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data: created, error } = await approval
        .from("master_department_reviewers")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterDepartmentReviewerById(
    id: string,
    data: MasterDepartmentReviewerUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("master_department_reviewers")
        .update(payload)
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterDepartmentReviewerInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { error } = await approval
        .from("master_department_reviewers")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
