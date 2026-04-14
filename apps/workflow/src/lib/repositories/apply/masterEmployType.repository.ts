import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterEmployType,
    MasterEmployTypeCreateInput,
    MasterEmployTypeUpdatePayload,
} from "@/schemas/apply/masterEmployTypeSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterEmployType(): Promise<FetchResult<MasterEmployType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("apply");

    const { data, error } = await approval
        .from("master_employ_types")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterEmployTypeById(id: string): Promise<FetchResult<MasterEmployType>> {
    const supabase = await createClient();
    const approval = supabase.schema("apply");

    const { data, error } = await approval
        .from("master_employ_types")
        .select(`*`)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterEmployTypeByCode(code: string): Promise<FetchResult<MasterEmployType>> {
    const supabase = await createClient();
    const approval = supabase.schema("apply");

    const { data, error } = await approval
        .from("master_employ_types")
        .select(`*`)
        .eq("code", code)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterEmployType(
    data: MasterEmployTypeCreateInput
): Promise<FetchResult<MasterEmployType>> {
    const supabase = await createClient();
    const approval = supabase.schema("apply");

    const { data: created, error } = await approval
        .from("master_employ_types")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterEmployTypeById(
    id: string,
    data: MasterEmployTypeUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("master_employ_types")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterEmployTypeInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("apply");

    const { error } = await approval
        .from("master_employ_types")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
