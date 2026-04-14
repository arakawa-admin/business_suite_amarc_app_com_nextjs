"use server";

import {
    ApprovalCreateInput,
    ApprovalUpdatePayload,
} from "@/schemas/approval/approvalSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovals,
    fetchApprovalById,
    insertApproval,
    updateApprovalById,
} from "@/lib/repositories/approval/approval.repository";

export async function getApprovals() {
    try {
        const res = await fetchApprovals();
        if (!res.ok) {
            return { ok: false as const, error: "稟議書一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalById(id: string) {
    try {
        const res = await fetchApprovalById(id);
        if (!res.ok) return { ok: false as const, error: "稟議書の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "稟議書が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApproval(data: ApprovalCreateInput) {
    try {
        const res = await insertApproval(data);
        if (!res.ok) {
            return { ok: false as const, error: "稟議書の登録に失敗しました" };
        }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApproval(
    id: string,
    data: ApprovalUpdatePayload
) {
    try {
        const res = await updateApprovalById(id, data);
        if (!res.ok) { return { ok: false as const, error: "稟議書の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
