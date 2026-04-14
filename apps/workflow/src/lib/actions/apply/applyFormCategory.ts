"use server";

import {
    ApplyFormCategoryCreateInput,
    ApplyFormCategoryUpdatePayload,
} from "@/schemas/apply/applyFormCategorySchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchApplyFormCategories,
    fetchApplyFormCategoryById,
    fetchApplyFormCategoryByCode,
    insertApplyFormCategory,
    updateApplyFormCategoryById,
    updateApplyFormCategoryInvalidAt,
} from "@/lib/repositories/apply/applyFormCategory.repository";

export async function getApplyFormCategorys() {
    try {
        const res = await fetchApplyFormCategories();
        if (!res.ok) {
            return { ok: false as const, error: "申請書カテゴリー一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplyFormCategoryById(id: string) {
    try {
        const res = await fetchApplyFormCategoryById(id);
        if (!res.ok) return { ok: false as const, error: "申請書カテゴリーの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書カテゴリーが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplyFormCategoryByCode(code: string) {
    try {
        const res = await fetchApplyFormCategoryByCode(code);
        if (!res.ok) return { ok: false as const, error: "申請書カテゴリーの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書カテゴリーが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApplyFormCategory(data: ApplyFormCategoryCreateInput) {
    try {
        const res = await insertApplyFormCategory(data);
        if (!res.ok) { return { ok: false as const, error: "申請書カテゴリーの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApplyFormCategory(
    id: string,
    data: ApplyFormCategoryUpdatePayload
) {
    try {
        const res = await updateApplyFormCategoryById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請書カテゴリーの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplyFormCategoryById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableApplyFormCategory(id: string) {
    try {
        const res = await updateApplyFormCategoryInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "申請書カテゴリーの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplyFormCategoryById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableApplyFormCategory(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateApplyFormCategoryInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "申請書カテゴリーの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplyFormCategoryById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
