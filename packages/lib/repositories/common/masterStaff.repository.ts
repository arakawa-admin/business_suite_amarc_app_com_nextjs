import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    MasterStaffType,
    MasterStaffCreateInput,
    MasterStaffUpdatePayload,
} from "@/schemas/common/masterStaffSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchMasterStaffs(): Promise<FetchResult<MasterStaffType[]>> {
    const supabase = await createClient();
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
        `)
        .order("kana");

    if (staffErr) throw staffErr;

    const staffIds = (staffs ?? []).map(s => s.id);

    const apply = supabase.schema("apply");
    const { data: options, error: optErr } = await apply
        .from("master_staff_options")
        .select(`
            *,
            employ_type:master_employ_types!fk_employ_type(*)
        `)
        .in("staff_id", staffIds);

    if (optErr) throw optErr;

    // staff_id で map 化
    const optionMap = new Map((options ?? []).map(o => [o.staff_id, o]));
    // staff_option をマージ
    const merged = (staffs ?? []).map(s => ({
        ...s,
        staff_option: optionMap.get(s.id) ?? null,
    }));

    return { ok: true, data: merged };
}

export async function fetchMasterStaffById(id: string): Promise<FetchResult<MasterStaffType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("master_staffs")
        .select(`
            *,
            memberships:staff_departments(
                id,
                department:master_departments(*)
            ),
            login_user:master_login_users!fk_login_user(*)
        `)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertMasterStaff(
    data: MasterStaffCreateInput
): Promise<FetchResult<MasterStaffType>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    delete data.department_ids;

    const { data: created, error } = await common
        .from("master_staffs")
        .insert(data)
        .select("*")
        .single();

    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateMasterStaffById(
    id: string,
    data: MasterStaffUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    delete data.department_ids;

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await common
        .from("master_staffs")
        .update(payload)
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateMasterStaffInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { error } = await common
        .from("master_staffs")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
