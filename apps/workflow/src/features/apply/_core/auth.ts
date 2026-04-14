"use server";

import { createClient } from "@supabase-shared/server";

export async function requireCurrentStaff(currentStaffId: string) {
    const supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user?.email) {
        return { ok: false as const, message: "認証が必要です" };
    }

    const common = supabase.schema("common");

    const { data: lu, error: luErr } = await common
        .from("master_login_users")
        .select("id")
        .eq("email", auth.user.email)
        .maybeSingle();

    if (luErr || !lu) {
        return { ok: false as const, message: "ログインユーザが未登録です" };
    }

    const { data: staff, error: staffErr } = await common
        .from("master_staffs")
        .select("id")
        .eq("id", currentStaffId)
        .eq("login_user_id", lu.id)
        .maybeSingle();

    if (staffErr || !staff) {
        return { ok: false as const, message: "スタッフ選択が不正です" };
    }

    return { ok: true as const, staffId: staff.id, supabase };
}
