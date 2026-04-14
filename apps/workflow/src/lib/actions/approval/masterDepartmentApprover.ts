"use server";

import {
    MasterDepartmentApproverCreateInput,
    MasterDepartmentApproverUpdatePayload,
} from "@/schemas/approval/masterDepartmentApproverSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchMasterDepartmentApprovers,
    fetchMasterDepartmentApproversByDeptId,
    fetchMasterDepartmentApproverById,
    insertMasterDepartmentApprover,
    updateMasterDepartmentApproverById,
    updateMasterDepartmentApproverInvalidAt,
} from "@/lib/repositories/approval/masterDepartmentApprover.repository";

export async function getMasterDepartmentApprovers() {
    try {
        const res = await fetchMasterDepartmentApprovers();
        if (!res.ok) {
            return { ok: false as const, error: "承認者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterDepartmentApproversByDeptId(deptId: string) {
    try {
        const res = await fetchMasterDepartmentApproversByDeptId(deptId);
        if (!res.ok) {
            return { ok: false as const, error: "承認者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}


export async function getMasterDepartmentApproverById(id: string) {
    try {
        const res = await fetchMasterDepartmentApproverById(id);
        if (!res.ok) return { ok: false as const, error: "承認者マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "承認者マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterDepartmentApprover(data: MasterDepartmentApproverCreateInput) {
    try {
        const res = await insertMasterDepartmentApprover(data);
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterDepartmentApprover(
    id: string,
    data: MasterDepartmentApproverUpdatePayload
) {
    try {
        const res = await updateMasterDepartmentApproverById(id, data);
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterDepartmentApproverById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterDepartmentApprover(id: string) {
    try {
        const res = await updateMasterDepartmentApproverInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterDepartmentApproverById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableMasterDepartmentApprover(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterDepartmentApproverInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterDepartmentApproverById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
