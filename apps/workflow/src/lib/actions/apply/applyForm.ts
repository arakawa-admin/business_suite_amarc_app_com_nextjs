"use server";

import {
    ApplyFormCreateInput,
    // ApplyFormUpdateInput,
    ApplyFormUpdatePayload,
} from "@/schemas/apply/applyFormSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchApplyForms,
    fetchApplyFormById,
    fetchApplyFormByCode,
    insertApplyForm,
    updateApplyFormById,
    updateApplyFormInvalidAt,
} from "@/lib/repositories/apply/applyForm.repository";

export async function getApplyForms() {
    try {
        const res = await fetchApplyForms();
        if (!res.ok) {
            return { ok: false as const, error: "申請書一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplyFormById(id: string) {
    try {
        const res = await fetchApplyFormById(id);
        if (!res.ok) return { ok: false as const, error: "申請書の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplyFormByCode(code: string) {
    try {
        const res = await fetchApplyFormByCode(code);
        if (!res.ok) return { ok: false as const, error: "申請書の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApplyForm(data: ApplyFormCreateInput) {
    try {
        const res = await insertApplyForm(data);
        if (!res.ok) { return { ok: false as const, error: "申請書の登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApplyForm(
    id: string,
    data: ApplyFormUpdatePayload
) {
    try {
        const res = await updateApplyFormById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請書の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplyFormById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableApplyForm(id: string) {
    try {
        const res = await updateApplyFormInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "申請書の有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplyFormById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableApplyForm(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateApplyFormInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "申請書の無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplyFormById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
