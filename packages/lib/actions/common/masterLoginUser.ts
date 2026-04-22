"use server";

import {
    MasterLoginUserCreateInput,
    MasterLoginUserUpdatePayload,
} from "../../../schemas/common/masterLoginUserSchema";

import { subDays } from "date-fns";

import { revalidatePath } from "next/cache";

import {
    fetchMasterLoginUsers,
    fetchMasterLoginUserById,
    fetchMasterLoginUserByEmail,
    insertMasterLoginUser,
    updateMasterLoginUserById,
    updateMasterLoginUserInvalidAt,
} from "../../repositories/common/masterLoginUser.repository";

export async function getMasterLoginUsers() {
    try {
        const res = await fetchMasterLoginUsers();
        if (!res.ok) {
            return { ok: false as const, error: "ログインユーザマスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterLoginUserById(id: string) {
    try {
        const res = await fetchMasterLoginUserById(id);
        if (!res.ok) return { ok: false as const, error: "ログインユーザマスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "ログインユーザマスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterLoginUserByEmail(email: string) {
    try {
        const res = await fetchMasterLoginUserByEmail(email);
        if (!res.ok) return { ok: false as const, error: "ログインユーザマスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "ログインユーザマスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterLoginUser(data: MasterLoginUserCreateInput) {
    try {
        const res = await insertMasterLoginUser(data);
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterLoginUser(
    id: string,
    data: MasterLoginUserUpdatePayload
) {
    try {
        const res = await updateMasterLoginUserById(id, data);
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの更新に失敗しました" } };

        revalidatePath("/");
        const updated = await fetchMasterLoginUserById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterLoginUser(id: string) {
    try {
        const res = await updateMasterLoginUserInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterLoginUserById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableMasterLoginUser(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterLoginUserInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "ログインユーザマスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterLoginUserById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
