import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterLoginUserType,
    MasterLoginUserCreateInput,
    MasterLoginUserUpdatePayload,
} from "@/schemas/common/masterLoginUserSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterLoginUsers(): Promise<FetchResult<MasterLoginUserType[]>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_login_users")
        .select("*")
        ;

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterLoginUserById(id: string): Promise<FetchResult<MasterLoginUserType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_login_users")
        .select(
                `*,
                staffs:master_staffs(
                    *,
                    login_user:master_login_users!fk_login_user(*),
                    department:master_departments!fk_department(*)
                )
            `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchMasterLoginUserByEmail(email: string): Promise<FetchResult<MasterLoginUserType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_login_users")
        .select(
                `*,
                staffs:master_staffs(
                    *,
                    login_user:master_login_users!fk_login_user(*),
                    department:master_departments!fk_department(*)
                )
            `)
        .eq("email", email)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterLoginUser(
    data: MasterLoginUserCreateInput
): Promise<FetchResult<MasterLoginUserType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data: created, error } = await common
        .from("master_login_users")
        .insert(data)
        .single();

    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterLoginUserById(
    id: string,
    data: MasterLoginUserUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const { error } = await common
        .from("master_login_users")
        .update(payload)
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

export async function updateMasterLoginUserInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { error } = await common
        .from("master_login_users")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
