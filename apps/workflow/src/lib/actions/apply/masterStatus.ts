"use server";

import {
    MasterStatusCreateInput,
    MasterStatusUpdatePayload,
} from "@/schemas/apply/masterStatusSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchMasterStatus,
    fetchMasterStatusById,
    fetchMasterStatusByCode,
    insertMasterStatus,
    updateMasterStatusById,
    updateMasterStatusInvalidAt,
} from "@/lib/repositories/apply/masterStatus.repository";

export async function getMasterStatus() {
    try {
        const res = await fetchMasterStatus();
        if (!res.ok) {
            return { ok: false as const, error: "ステータスマスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterStatusById(id: string) {
    try {
        const res = await fetchMasterStatusById(id);
        if (!res.ok) return { ok: false as const, error: "ステータスマスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "ステータスマスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterStatusByCode(code: string) {
    try {
        const res = await fetchMasterStatusByCode(code);
        if (!res.ok) return { ok: false as const, error: "ステータスマスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "ステータスマスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterStatus(data: MasterStatusCreateInput) {
    try {
        const res = await insertMasterStatus(data);
        if (!res.ok) { return { ok: false as const, error: "ステータスマスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterStatus(
    id: string,
    data: MasterStatusUpdatePayload
) {
    try {
        const res = await updateMasterStatusById(id, data);
        if (!res.ok) { return { ok: false as const, error: "ステータスマスタの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterStatusById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterStatus(id: string) {
    try {
        const res = await updateMasterStatusInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "ステータスマスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterStatusById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableMasterStatus(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterStatusInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "ステータスマスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterStatusById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
