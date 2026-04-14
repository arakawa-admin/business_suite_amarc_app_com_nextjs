import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterCompanyType,
    MasterCompanyCreateInput,
    MasterCompanyUpdatePayload,
} from "@/schemas/common/masterCompanySchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterCompanys(): Promise<FetchResult<MasterCompanyType[]>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_companys")
        .select(`*`)
        .order("sort_order");

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterCompanyById(id: string): Promise<FetchResult<MasterCompanyType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_companys")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterCompanyByCode(code: string): Promise<FetchResult<MasterCompanyType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_companys")
        .select("*")
        .eq("code", code)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterCompany(
    data: MasterCompanyCreateInput
): Promise<FetchResult<MasterCompanyType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data: created, error } = await common
        .from("master_companys")
        .insert(data)
        .single();

    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterCompanyById(
    id: string,
    data: MasterCompanyUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const { error } = await common
        .from("master_companys")
        .update(payload)
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterCompanyInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { error } = await common
        .from("master_companys")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
