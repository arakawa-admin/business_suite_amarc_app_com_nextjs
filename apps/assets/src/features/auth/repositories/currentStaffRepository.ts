import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@supabase-shared/server";
import { SELECTED_STAFF_COOKIE_KEY } from "../constants/authConstants";
import {
    CurrentStaffNotFoundError,
    StaffSelectionRequiredError,
} from "../errors/authErrors";

type DepartmentRow = {
    id: string;
    name: string;
    code?: string | null;
};

type StaffDepartmentMembershipRow = {
    id: string;
    department?: DepartmentRow[] | null;
};

export type CurrentStaffRow = {
    id: string;
    login_user_id: string;
    name: string;
    kana?: string | null;
    remarks?: string | null;
    valid_at?: string | null;
    invalid_at?: string | null;
    memberships?: StaffDepartmentMembershipRow[];
    department?: DepartmentRow | null;
};

type LoginUserWithStaffsRow = {
    id: string;
    name: string;
    email: string;
    is_admin: boolean;
    staffs: CurrentStaffRow[];
};

function normalizeStaff(staff: CurrentStaffRow): CurrentStaffRow {
    const department = staff.memberships?.[0]?.department?.[0] ?? null;
    return {
        ...staff,
        department,
    };
}


// 1. Supabase auth でログイン user を取得
// 2. email から master_login_users を取得
// 3. その user に紐づく staffs を取得
// 4. cookie の selected_staff_id を読む
// 5. その staffId が user.staffs に含まれているか確認
// 6. 含まれていればそれを返す
// 7. staffs が1件しかなければ自動でそれを返す
// 8. 複数なのに未選択なら StaffSelectionRequiredError を投げる
export async function findCurrentStaffOrThrow(): Promise<CurrentStaffRow> {
    const supabase = await createClient();
    const common = supabase.schema("common");

    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser?.email) {
        throw new CurrentStaffNotFoundError(
            "ログインユーザーを取得できません。",
        );
    }

    const { data, error } = await common
        .from("master_login_users")
        .select(
            `
            id,
            name,
            email,
            is_admin,
            staffs:master_staffs(
                id,
                login_user_id,
                name,
                kana,
                remarks,
                valid_at,
                invalid_at,
                memberships:staff_departments(
                    id,
                    department:master_departments(
                        id,
                        name,
                        code
                    )
                )
            )
            `,
        )
        .eq("email", authUser.email)
        .maybeSingle();

    if (error || !data) {
        throw new CurrentStaffNotFoundError(
            "ログインユーザーに対応するスタッフ情報が見つかりません。",
        );
    }

    const loginUser = data as LoginUserWithStaffsRow;
    const staffs = (loginUser.staffs ?? []).map(normalizeStaff);

    if (staffs.length === 0) {
        throw new CurrentStaffNotFoundError("利用可能なスタッフがありません。");
    }

    if (staffs.length === 1) {
        return staffs[0];
    }

    const cookieStore = await cookies();
    const selectedStaffId =
        cookieStore.get(SELECTED_STAFF_COOKIE_KEY)?.value ?? null;

    if (!selectedStaffId) {
        throw new StaffSelectionRequiredError();
    }

    const selectedStaff = staffs.find((staff) => staff.id === selectedStaffId);

    if (!selectedStaff) {
        throw new StaffSelectionRequiredError(
            "選択済みスタッフが無効です。再選択してください。",
        );
    }

    return selectedStaff;
}

export async function findCurrentStaffIdOrThrow(): Promise<string> {
    const staff = await findCurrentStaffOrThrow();
    return staff.id;
}
