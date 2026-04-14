import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterStaffOptionType,
    MasterStaffOptionCreateInput,
    MasterStaffOptionUpdatePayload,
} from "@/schemas/apply/masterStaffOptionSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterStaffOptions(): Promise<FetchResult<MasterStaffOptionType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("master_staff_options")
        .select(`
            *,
            employ_type:master_employ_types!fk_employ_type(*)
        `)
        ;

    const common = supabase.schema("common");
    const { data: staffs, error: staffErr } = await common
        .from("master_staffs")
        .select(`
            *,
            memberships:staff_departments(
                id,
                department:master_departments(*)
            ),
            login_user:master_login_users!fk_login_user(*)
        `);
    if (staffErr) throw staffErr;
    // staff_id で map 化
    const staffMap = new Map((staffs ?? []).map(s => [s.id, s]));
    const merged = (data ?? []).map(o => ({
        ...o,
        staff: staffMap.get(o.staff_id) ?? null,
    }));

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: merged };
}

export async function fetchMasterStaffOptionById(id: string): Promise<FetchResult<MasterStaffOptionType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("master_staff_options")
        .select(`
            *,
            employ_type:master_employ_types!fk_employ_type(*)
        `)
        .eq("id", id)
        .single();

    const common = supabase.schema("common");
    const { data: staff, error: staffErr } = await common
        .from("master_staffs")
        .select(`
            *,
            memberships:staff_departments(
                id,
                department:master_departments(*)
            ),
            login_user:master_login_users!fk_login_user(*)
        `)
        .eq("id", data.staff_id)
        .single();
        ;
    if (staffErr) throw staffErr;
    const merged = { ...data, staff: staff ?? null };

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: merged };
}

export async function insertMasterStaffOption(
    data: MasterStaffOptionCreateInput
): Promise<FetchResult<MasterStaffOptionType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data: created, error } = await apply
        .from("master_staff_options")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterStaffOptionById(
    id: string,
    data: MasterStaffOptionUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("master_staff_options")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterStaffOptionInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { error } = await apply
        .from("master_staff_options")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
