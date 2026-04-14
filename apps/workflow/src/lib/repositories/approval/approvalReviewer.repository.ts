import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalReviewerType,
    ApprovalReviewerCreateInput,
    ApprovalReviewerUpdatePayload,
} from "@/schemas/approval/approvalReviewerSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalReviewers(): Promise<FetchResult<ApprovalReviewerType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_reviewers")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            reviewer_user:master_staffs!fk_reviewer_user(*)
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}


export async function fetchApprovalReviewersByDeptId(deptId: string): Promise<FetchResult<ApprovalReviewerType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_reviewers")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            reviewer_user:master_staffs!fk_reviewer_user(*)
        `)
        .eq("department_id", deptId)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalReviewerById(id: string): Promise<FetchResult<ApprovalReviewerType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_reviewers")
        .select(`
            *,
            approval:approvals!fk_approval(*),
            reviewer_user:master_staffs!fk_reviewer_user(*)
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalReviewer(
    data: ApprovalReviewerCreateInput
): Promise<FetchResult<ApprovalReviewerType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data: created, error } = await approval
        .from("approval_reviewers")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalReviewerById(
    id: string,
    data: ApprovalReviewerUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("approval_reviewers")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
