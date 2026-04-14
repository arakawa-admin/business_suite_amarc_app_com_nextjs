"use server";

import {
    ApprovalActionCreateInput,
    ApprovalActionUpdatePayload,
} from "@/schemas/apply/approvalActionSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalActions,
    fetchApprovalActionById,
    insertApprovalAction,
    updateApprovalActionById,
    deleteApprovalActionById,
} from "@/lib/repositories/apply/approvalAction.repository";

export async function getApprovalActions() {
    try {
        const res = await fetchApprovalActions();
        if (!res.ok) {
            return { ok: false as const, error: "決裁コメント一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalActionById(id: string) {
    try {
        const res = await fetchApprovalActionById(id);
        if (!res.ok) return { ok: false as const, error: "決裁コメントの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "決裁コメントが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalAction(data: ApprovalActionCreateInput) {
    try {
        const res = await insertApprovalAction(data);
        if (!res.ok) { return { ok: false as const, error: "決裁コメントの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalAction(
    id: string,
    data: ApprovalActionUpdatePayload
) {
    try {
        const res = await updateApprovalActionById(id, data);
        if (!res.ok) { return { ok: false as const, error: "決裁コメントの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalActionById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function deleteApprovalAction(
    id: string
) {
    try {
        const res = await deleteApprovalActionById(id);
        if (!res.ok) { return { ok: false as const, error: "決裁コメントの削除に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
