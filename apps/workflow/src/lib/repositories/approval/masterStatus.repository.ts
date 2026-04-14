import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterStatusType,
    MasterStatusCreateInput,
    MasterStatusUpdatePayload,
} from "@/schemas/approval/masterStatusSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterStatus(): Promise<FetchResult<MasterStatusType[]>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_status")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterStatusById(id: string): Promise<FetchResult<MasterStatusType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_status")
        .select(`*`)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterStatusByCode(code: string): Promise<FetchResult<MasterStatusType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data, error } = await approval
        .from("master_status")
        .select(`*`)
        .eq("code", code)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterStatus(
    data: MasterStatusCreateInput
): Promise<FetchResult<MasterStatusType>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { data: created, error } = await approval
        .from("master_status")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterStatusById(
    id: string,
    data: MasterStatusUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await approval
        .from("master_status")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterStatusInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    const { error } = await approval
        .from("master_status")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
