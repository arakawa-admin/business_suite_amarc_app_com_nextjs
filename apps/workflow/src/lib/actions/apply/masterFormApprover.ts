"use server";

import {
    MasterFormApproverCreateInput,
    MasterFormApproverUpdatePayload,
} from "@/schemas/apply/masterFormApproverSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchMasterFormApprovers,
    fetchMasterFormApproversByDeptIdAndFormId,
    fetchMasterFormApproverById,
    insertMasterFormApprover,
    updateMasterFormApproverById,
    updateMasterFormApproverInvalidAt,
} from "@/lib/repositories/apply/masterFormApprover.repository";

export async function getMasterFormApprovers() {
    try {
        const res = await fetchMasterFormApprovers();
        if (!res.ok) {
            return { ok: false as const, error: "承認者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterFormApproversByDeptIdAndFormId(deptId: string, formId: string) {
    try {
        const res = await fetchMasterFormApproversByDeptIdAndFormId(deptId, formId);
        if (!res.ok) {
            return { ok: false as const, error: "承認者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}


export async function getMasterFormApproverById(id: string) {
    try {
        const res = await fetchMasterFormApproverById(id);
        if (!res.ok) return { ok: false as const, error: "承認者マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "承認者マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterFormApprover(data: MasterFormApproverCreateInput) {
    try {
        const res = await insertMasterFormApprover(data);
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterFormApprover(
    id: string,
    data: MasterFormApproverUpdatePayload
) {
    try {
        const res = await updateMasterFormApproverById(id, data);
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterFormApproverById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterFormApprover(id: string) {
    try {
        const res = await updateMasterFormApproverInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterFormApproverById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableMasterFormApprover(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterFormApproverInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "承認者マスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterFormApproverById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
