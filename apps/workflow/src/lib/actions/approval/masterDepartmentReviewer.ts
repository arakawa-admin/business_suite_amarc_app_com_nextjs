"use server";

import {
    MasterDepartmentReviewerCreateInput,
    MasterDepartmentReviewerUpdatePayload,
} from "@/schemas/approval/masterDepartmentReviewerSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchMasterDepartmentReviewers,
    fetchMasterDepartmentReviewersByDeptId,
    fetchMasterDepartmentReviewerById,
    insertMasterDepartmentReviewer,
    updateMasterDepartmentReviewerById,
    updateMasterDepartmentReviewerInvalidAt,
} from "@/lib/repositories/approval/masterDepartmentReviewer.repository";

export async function getMasterDepartmentReviewers() {
    try {
        const res = await fetchMasterDepartmentReviewers();
        if (!res.ok) {
            return { ok: false as const, error: "回議者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterDepartmentReviewersByDeptId(deptId: string) {
    try {
        const res = await fetchMasterDepartmentReviewersByDeptId(deptId);
        if (!res.ok) {
            return { ok: false as const, error: "回議者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterDepartmentReviewerById(id: string) {
    try {
        const res = await fetchMasterDepartmentReviewerById(id);
        if (!res.ok) return { ok: false as const, error: "回議者マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "回議者マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterDepartmentReviewer(data: MasterDepartmentReviewerCreateInput) {
    try {
        const res = await insertMasterDepartmentReviewer(data);
        if (!res.ok) { return { ok: false as const, error: "回議者マスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterDepartmentReviewer(
    id: string,
    data: MasterDepartmentReviewerUpdatePayload
) {
    try {
        const res = await updateMasterDepartmentReviewerById(id, data);
        if (!res.ok) { return { ok: false as const, error: "回議者マスタの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterDepartmentReviewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterDepartmentReviewer(id: string) {
    try {
        const res = await updateMasterDepartmentReviewerInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "回議者マスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterDepartmentReviewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}


// 無効化
export async function disableMasterDepartmentReviewer(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterDepartmentReviewerInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "回議者マスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterDepartmentReviewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
