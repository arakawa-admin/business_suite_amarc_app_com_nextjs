"use server";

import {
    ApprovalRevisionAttachmentCreateInput,
    ApprovalRevisionAttachmentUpdatePayload,
} from "@/schemas/approval/approvalRevisionAttachmentSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalRevisionAttachments,
    fetchApprovalRevisionAttachmentById,
    insertApprovalRevisionAttachment,
    updateApprovalRevisionAttachmentById,
} from "@/lib/repositories/approval/approvalRevisionAttachment.repository";

export async function getApprovalRevisionAttachments() {
    try {
        const res = await fetchApprovalRevisionAttachments();
        if (!res.ok) {
            return { ok: false as const, error: "稟議書改訂添付一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalRevisionAttachmentById(id: string) {
    try {
        const res = await fetchApprovalRevisionAttachmentById(id);
        if (!res.ok) return { ok: false as const, error: "稟議書改訂添付の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "稟議書改訂添付が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalRevisionAttachment(data: ApprovalRevisionAttachmentCreateInput) {
    try {
        const res = await insertApprovalRevisionAttachment(data);
        if (!res.ok) {
            return { ok: false as const, error: "稟議書改訂添付の登録に失敗しました" };
        }
        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalRevisionAttachment(
    id: string,
    data: ApprovalRevisionAttachmentUpdatePayload
) {
    try {
        const res = await updateApprovalRevisionAttachmentById(id, data);
        if (!res.ok) { return { ok: false as const, error: "稟議書改訂添付の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalRevisionAttachmentById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
