"use server";

import {
    MasterStaffOptionCreateInput,
    MasterStaffOptionUpdatePayload,
} from "@/schemas/apply/masterStaffOptionSchema";

import { revalidatePath } from "next/cache";

import {
    fetchMasterStaffOptions,
    fetchMasterStaffOptionById,
    insertMasterStaffOption,
    updateMasterStaffOptionById,
} from "@/lib/repositories/apply/masterStaffOption.repository";

export async function getMasterStaffOptions() {
    try {
        const res = await fetchMasterStaffOptions();
        if (!res.ok) {
            return { ok: false as const, error: "スタッフオプションマスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterStaffOptionById(id: string) {
    try {
        const res = await fetchMasterStaffOptionById(id);
        if (!res.ok) return { ok: false as const, error: "スタッフオプションマスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "スタッフオプションマスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterStaffOption(data: MasterStaffOptionCreateInput) {
    try {
        const res = await insertMasterStaffOption(data);
        if (!res.ok) { return { ok: false as const, error: "スタッフオプションマスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterStaffOption(
    id: string,
    data: MasterStaffOptionUpdatePayload
) {
    try {
        const res = await updateMasterStaffOptionById(id, data);
        if (!res.ok) { return { ok: false as const, error: "スタッフオプションマスタの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterStaffOptionById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
