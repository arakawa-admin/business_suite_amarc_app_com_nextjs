import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterFormViewerType,
    MasterFormViewerCreateInput,
    MasterFormViewerUpdatePayload,
} from "@/schemas/apply/masterFormViewerSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterFormViewers(): Promise<FetchResult<MasterFormViewerType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("master_form_viewers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            apply_form:apply_forms!fk_apply_form(*),
            viewer_user:master_staffs!fk_viewer_user(*)
        `);

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterFormViewersByDeptIdAndFormId(deptId: string, formId: string): Promise<FetchResult<MasterFormViewerType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("master_form_viewers")
        .select(`
            *,
            department:master_departments!fk_department(*),
            apply_form:apply_forms!fk_apply_form(*),
            viewer_user:master_staffs!fk_viewer_user(*)
        `)
        .eq("department_id", deptId)
        .eq("apply_form_id", formId)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterFormViewerById(id: string): Promise<FetchResult<MasterFormViewerType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("master_form_viewers")
        .select(`
            *,
            form:master_forms!fk_form(*),
            apply_form:apply_forms!fk_apply_form(*),
            viewer_user:master_staffs!fk_viewer_user(*)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterFormViewer(
    data: MasterFormViewerCreateInput
): Promise<FetchResult<MasterFormViewerType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data: created, error } = await apply
        .from("master_form_viewers")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterFormViewerById(
    id: string,
    data: MasterFormViewerUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("master_form_viewers")
        .update(payload)
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterFormViewerInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { error } = await apply
        .from("master_form_viewers")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
