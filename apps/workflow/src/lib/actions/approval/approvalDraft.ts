"use server";

import {
    ApprovalDraftCreateInput,
    ApprovalDraftUpdatePayload,
} from "@/schemas/approval/approvalDraftSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalDrafts,
    fetchApprovalDraftsByOwnerId,
    fetchApprovalDraftById,
    insertApprovalDraft,
    updateApprovalDraftById,
    deleteApprovalDraftById,
} from "@/lib/repositories/approval/approvalDraft.repository";

export async function getApprovalDrafts() {
    try {
        const res = await fetchApprovalDrafts();
        if (!res.ok) {
            return { ok: false as const, error: "稟議下書き一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalDraftsByOwnerId(owner_user_id: string) {
    try {
        const res = await fetchApprovalDraftsByOwnerId(owner_user_id);
        if (!res.ok) {
            return { ok: false as const, error: "稟議下書き一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalDraftById(id: string) {
    try {
        const res = await fetchApprovalDraftById(id);
        if (!res.ok) return { ok: false as const, error: "稟議下書きの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "稟議下書きが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalDraft(data: ApprovalDraftCreateInput) {
    try {
        const res = await insertApprovalDraft(data);
        if (!res.ok) { return { ok: false as const, error: "稟議下書きの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalDraft(
    id: string,
    data: ApprovalDraftUpdatePayload
) {
    try {
        const res = await updateApprovalDraftById(id, data);
        if (!res.ok) { return { ok: false as const, error: "稟議下書きの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalDraftById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function deleteApprovalDraft(
    id: string
) {
    try {
        const res = await deleteApprovalDraftById(id);
        if (!res.ok) { return { ok: false as const, error: "稟議下書きの削除に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
