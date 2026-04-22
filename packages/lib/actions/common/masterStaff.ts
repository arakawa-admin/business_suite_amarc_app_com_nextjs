"use server";

import {
    MasterStaffCreateInput,
    MasterStaffUpdatePayload,
} from "../../../schemas/common/masterStaffSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchMasterStaffs,
    fetchMasterStaffById,
    insertMasterStaff,
    updateMasterStaffById,
    updateMasterStaffInvalidAt,
} from "../../repositories/common/masterStaff.repository";

export async function getMasterStaffs() {
    try {
        const res = await fetchMasterStaffs();
        if (!res.ok) {
            return { ok: false as const, error: "ログインユーザマスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterStaffById(id: string) {
    try {
        const res = await fetchMasterStaffById(id);
        if (!res.ok) return { ok: false as const, error: "ログインユーザマスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "ログインユーザマスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterStaff(data: MasterStaffCreateInput) {
    try {
        const res = await insertMasterStaff(data);
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterStaff(
    id: string,
    data: MasterStaffUpdatePayload
) {
    try {
        const res = await updateMasterStaffById(id, data);
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの更新に失敗しました" } };

        revalidatePath("/");
        const updated = await fetchMasterStaffById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterStaff(id: string) {
    try {
        const res = await updateMasterStaffInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterStaffById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}


// 無効化
export async function disableMasterStaff(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterStaffInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterStaffById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
