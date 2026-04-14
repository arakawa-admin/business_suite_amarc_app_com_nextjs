"use server";

import {
    MasterEmployTypeCreateInput,
    MasterEmployTypeUpdatePayload,
} from "@/schemas/apply/masterEmployTypeSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchMasterEmployType,
    fetchMasterEmployTypeById,
    fetchMasterEmployTypeByCode,
    insertMasterEmployType,
    updateMasterEmployTypeById,
    updateMasterEmployTypeInvalidAt,
} from "@/lib/repositories/apply/masterEmployType.repository";

export async function getMasterEmployType() {
    try {
        const res = await fetchMasterEmployType();
        if (!res.ok) {
            return { ok: false as const, error: "雇用形態マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterEmployTypeById(id: string) {
    try {
        const res = await fetchMasterEmployTypeById(id);
        if (!res.ok) return { ok: false as const, error: "雇用形態マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "雇用形態マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterEmployTypeByCode(code: string) {
    try {
        const res = await fetchMasterEmployTypeByCode(code);
        if (!res.ok) return { ok: false as const, error: "雇用形態マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "雇用形態マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterEmployType(data: MasterEmployTypeCreateInput) {
    try {
        const res = await insertMasterEmployType(data);
        if (!res.ok) { return { ok: false as const, error: "雇用形態マスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterEmployType(
    id: string,
    data: MasterEmployTypeUpdatePayload
) {
    try {
        const res = await updateMasterEmployTypeById(id, data);
        if (!res.ok) { return { ok: false as const, error: "雇用形態マスタの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterEmployTypeById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterEmployType(id: string) {
    try {
        const res = await updateMasterEmployTypeInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "雇用形態マスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterEmployTypeById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableMasterEmployType(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterEmployTypeInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "雇用形態マスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterEmployTypeById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
