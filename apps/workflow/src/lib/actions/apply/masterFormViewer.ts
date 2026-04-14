"use server";

import {
    MasterFormViewerCreateInput,
    MasterFormViewerUpdatePayload,
} from "@/schemas/apply/masterFormViewerSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchMasterFormViewers,
    fetchMasterFormViewersByDeptIdAndFormId,
    fetchMasterFormViewerById,
    insertMasterFormViewer,
    updateMasterFormViewerById,
    updateMasterFormViewerInvalidAt,
} from "@/lib/repositories/apply/masterFormViewer.repository";

export async function getMasterFormViewers() {
    try {
        const res = await fetchMasterFormViewers();
        if (!res.ok) {
            return { ok: false as const, error: "閲覧者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterFormViewersByDeptIdAndFormId(deptId: string, formId: string) {
    try {
        const res = await fetchMasterFormViewersByDeptIdAndFormId(deptId, formId);
        if (!res.ok) {
            return { ok: false as const, error: "閲覧者マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterFormViewerById(id: string) {
    try {
        const res = await fetchMasterFormViewerById(id);
        if (!res.ok) return { ok: false as const, error: "閲覧者マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "閲覧者マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterFormViewer(data: MasterFormViewerCreateInput) {
    try {
        const res = await insertMasterFormViewer(data);
        if (!res.ok) { return { ok: false as const, error: "閲覧者マスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterFormViewer(
    id: string,
    data: MasterFormViewerUpdatePayload
) {
    try {
        const res = await updateMasterFormViewerById(id, data);
        if (!res.ok) { return { ok: false as const, error: "閲覧者マスタの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterFormViewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterFormViewer(id: string) {
    try {
        const res = await updateMasterFormViewerInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "閲覧者マスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterFormViewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}


// 無効化
export async function disableMasterFormViewer(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterFormViewerInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "閲覧者マスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchMasterFormViewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
