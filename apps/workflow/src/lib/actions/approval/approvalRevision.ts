"use server";

import {
    ApprovalRevisionCreateInput,
    ApprovalRevisionUpdatePayload,
} from "@/schemas/approval/approvalRevisionSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalRevisions,
    fetchApprovalRevisionById,
    insertApprovalRevision,
    updateApprovalRevisionById,
} from "@/lib/repositories/approval/approvalRevision.repository";

export async function getApprovalRevisions() {
    try {
        const res = await fetchApprovalRevisions();
        if (!res.ok) {
            return { ok: false as const, error: "稟議書改訂一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalRevisionById(id: string) {
    try {
        const res = await fetchApprovalRevisionById(id);
        if (!res.ok) return { ok: false as const, error: "稟議書改訂の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "稟議書改訂が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalRevision(data: ApprovalRevisionCreateInput) {
    try {
        const res = await insertApprovalRevision(data);
        if (!res.ok) {
            return { ok: false as const, error: "稟議書改訂の登録に失敗しました" };
        }
        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalRevision(
    id: string,
    data: ApprovalRevisionUpdatePayload
) {
    try {
        const res = await updateApprovalRevisionById(id, data);
        if (!res.ok) { return { ok: false as const, error: "稟議書改訂の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalRevisionById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
