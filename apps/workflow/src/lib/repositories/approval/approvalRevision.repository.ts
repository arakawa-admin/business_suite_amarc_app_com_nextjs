import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalRevisionType,
    ApprovalRevisionCreateInput,
    ApprovalRevisionUpdatePayload,
} from "@/schemas/approval/approvalRevisionSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalRevisions(): Promise<FetchResult<ApprovalRevisionType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_revisions")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalRevisionById(id: string): Promise<FetchResult<ApprovalRevisionType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("approval_revisions")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalRevision(
    data: ApprovalRevisionCreateInput
): Promise<FetchResult<ApprovalRevisionType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");
    const { data: created, error } = await approval
        .from("approval_revisions")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalRevisionById(
    id: string,
    data: ApprovalRevisionUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("approval_revisions")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
