"use server";

import {
    ApprovalActionAttachmentCreateInput,
    ApprovalActionAttachmentUpdatePayload,
} from "@/schemas/approval/approvalActionAttachmentSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalActionAttachments,
    fetchApprovalActionAttachmentById,
    insertApprovalActionAttachment,
    updateApprovalActionAttachmentById,
} from "@/lib/repositories/approval/approvalActionAttachment.repository";

export async function getApprovalActionAttachments() {
    try {
        const res = await fetchApprovalActionAttachments();
        if (!res.ok) {
            return { ok: false as const, error: "稟議書操作ログ添付一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalActionAttachmentById(id: string) {
    try {
        const res = await fetchApprovalActionAttachmentById(id);
        if (!res.ok) return { ok: false as const, error: "稟議書操作ログ添付の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "稟議書操作ログ添付が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalActionAttachment(data: ApprovalActionAttachmentCreateInput) {
    try {
        const res = await insertApprovalActionAttachment(data);
        if (!res.ok) {
            return { ok: false as const, error: "稟議書操作ログ添付の登録に失敗しました" };
        }
        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalActionAttachment(
    id: string,
    data: ApprovalActionAttachmentUpdatePayload
) {
    try {
        const res = await updateApprovalActionAttachmentById(id, data);
        if (!res.ok) { return { ok: false as const, error: "稟議書操作ログ添付の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalActionAttachmentById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
