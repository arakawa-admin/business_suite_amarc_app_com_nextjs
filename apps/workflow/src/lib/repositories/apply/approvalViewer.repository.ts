import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApprovalViewerType,
    ApprovalViewerCreateInput,
    ApprovalViewerUpdatePayload,
} from "@/schemas/apply/approvalViewerSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApprovalViewers(): Promise<FetchResult<ApprovalViewerType[]>> {
    const supabase = await createClient();
    const application = supabase.schema("apply");

    const { data, error } = await application
        .from("application_viewers")
        .select(`
            *,
            application:applications!fk_application(*),
            viewer_user:master_staffs!fk_viewer_user(*)
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}


export async function fetchApprovalViewersByDeptId(deptId: string): Promise<FetchResult<ApprovalViewerType[]>> {
    const supabase = await createClient();
    const application = supabase.schema("apply");

    const { data, error } = await application
        .from("application_viewers")
        .select(`
            *,
            application:applications!fk_application(*),
            viewer_user:master_staffs!fk_viewer_user(*)
        `)
        .eq("department_id", deptId)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApprovalViewerById(id: string): Promise<FetchResult<ApprovalViewerType>> {
    const supabase = await createClient();
    const application = supabase.schema("apply");

    const { data, error } = await application
        .from("application_viewers")
        .select(`
            *,
            application:applications!fk_application(*),
            viewer_user:master_staffs!fk_viewer_user(*)
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApprovalViewer(
    data: ApprovalViewerCreateInput
): Promise<FetchResult<ApprovalViewerType>> {
    const supabase = await createClient();
    const application = supabase.schema("apply");

    const { data: created, error } = await application
        .from("application_viewers")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApprovalViewerById(
    id: string,
    data: ApprovalViewerUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const application = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await application
        .from("application_viewers")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
