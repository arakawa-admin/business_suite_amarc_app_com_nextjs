"use server";

import {
    MasterDepartmentCreateInput,
    MasterDepartmentUpdatePayload,
} from "@/schemas/common/masterDepartmentSchema";
import { subDays } from "date-fns";

import { revalidatePath } from "next/cache";

import {
    fetchMasterDepartments,
    fetchMasterDepartmentById,
    fetchMasterDepartmentByCode,
    insertMasterDepartment,
    updateMasterDepartmentById,
    updateMasterDepartmentInvalidAt,
} from "@/lib/repositories/common/masterDepartment.repository";

export async function getMasterDepartments() {
    try {
        const res = await fetchMasterDepartments();
        if (!res.ok) {
            return { ok: false as const, error: "部門マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterDepartmentById(id: string) {
    try {
        const res = await fetchMasterDepartmentById(id);
        if (!res.ok) return { ok: false as const, error: "部門マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "部門マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterDepartmentByCode(code: string) {
    try {
        const res = await fetchMasterDepartmentByCode(code);
        if (!res.ok) return { ok: false as const, error: "部門マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "部門マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterDepartment(data: MasterDepartmentCreateInput) {
    try {
        const res = await insertMasterDepartment(data);
        if (!res.ok) { return { ok: false as const, error: "部門マスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterDepartment(
    id: string,
    data: MasterDepartmentUpdatePayload
) {
    try {
        const res = await updateMasterDepartmentById(id, data);
        if (!res.ok) { return { ok: false as const, error: "部門マスタの更新に失敗しました" } };

        revalidatePath("/");
        const updated = await getMasterDepartmentById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterDepartment(id: string) {
    try {
        const res = await updateMasterDepartmentInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "部門マスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await getMasterDepartmentById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableMasterDepartment(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterDepartmentInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "部門マスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await getMasterDepartmentById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
