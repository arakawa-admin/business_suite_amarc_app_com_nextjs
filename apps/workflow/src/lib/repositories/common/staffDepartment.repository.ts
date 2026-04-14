import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    StaffDepartmentCreateInput,
    StaffDepartmentUpdatePayload,
} from "@/schemas/common/staffDepartmentSchema";

export async function fetchStaffDepartments() {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("staff_departments")
        .select(`
            *,
            staff:master_staffs(*),
            department:master_departments(*)
        `)
        ;

    if (error) throw new Error("スタッフ所属部門一覧の取得に失敗しました");

    return data;
}

export async function fetchStaffDepartmentById(id: string) {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { data, error } = await common
        .from("staff_departments")
        .select(`
            *,
            staff:master_staffs(*),
            department:master_departments(*)
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) throw new Error("スタッフ所属部門の詳細取得に失敗しました");

    return data;
}

export async function insertStaffDepartment(
    data: StaffDepartmentCreateInput
) {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { error } = await common
        .from("staff_departments")
        .insert(data);

    if (error) throw new Error("スタッフ所属部門の登録に失敗しました");
}

export async function updateStaffDepartmentById(
    id: string,
    data: StaffDepartmentUpdatePayload
) {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const { error } = await common
        .from("staff_departments")
        .update(payload)
        .eq("id", id);
    if (error) throw new Error("スタッフ所属部門の更新に失敗しました");
}

export async function updateStaffAndDepartmentById(
    staff_id: string,
    department_ids: string[]
) {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { error } = await common.rpc("replace_staff_departments", {
        p_staff_id: staff_id,
        p_department_ids: department_ids,
    });
    // const { error } = await common
    //     .from("staff_departments")
    //     .upsert(
    //         { staff_id, department_id },
    //         { onConflict: "staff_id,department_id" }
    //     );
    if (error) throw new Error("スタッフ所属部門の更新に失敗しました");
}

// 有効化
export async function updateStaffDepartmentInvalidAt(
    id: string,
    invalidAt: Date
) {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const { error } = await common
        .from("staff_departments")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) throw new Error("スタッフ所属部門の有効化に失敗しました");
}
