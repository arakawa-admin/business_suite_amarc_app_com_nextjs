import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterDepartmentType,
    MasterDepartmentCreateInput,
    MasterDepartmentUpdatePayload,
} from "@/schemas/common/masterDepartmentSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterDepartments(): Promise<FetchResult<MasterDepartmentType[]>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_departments")
        .select(`*,
            memberships:staff_departments(
                *,
                staff:master_staffs(*)
            )
        `)
        .order("sort_order");

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterDepartmentById(id: string): Promise<FetchResult<MasterDepartmentType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_departments")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterDepartmentByCode(code: string): Promise<FetchResult<MasterDepartmentType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_departments")
        .select("*")
        .eq("code", code)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterDepartment(
    data: MasterDepartmentCreateInput
): Promise<FetchResult<MasterDepartmentType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data: created, error } = await common
        .from("master_departments")
        .insert(data)
        .single();

    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterDepartmentById(
    id: string,
    data: MasterDepartmentUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const { error } = await common
        .from("master_departments")
        .update(payload)
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterDepartmentInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { error } = await common
        .from("master_departments")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
