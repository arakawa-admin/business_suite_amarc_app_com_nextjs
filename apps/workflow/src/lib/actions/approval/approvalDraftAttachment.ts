"use server";

import {
    ApprovalDraftAttachmentCreateInput,
    ApprovalDraftAttachmentUpdatePayload,
} from "@/schemas/approval/approvalDraftAttachmentSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalDraftAttachments,
    fetchApprovalDraftAttachmentsByDraftId,
    fetchApprovalDraftAttachmentById,
    insertApprovalDraftAttachment,
    updateApprovalDraftAttachmentById,
    deleteApprovalDraftAttachmentById,
    deleteApprovalDraftAttachmentByAttachmentId
} from "@/lib/repositories/approval/approvalDraftAttachment.repository";

export async function getApprovalDraftAttachments() {
    try {
        const res = await fetchApprovalDraftAttachments();
        if (!res.ok) {
            return { ok: false as const, error: "稟議書下書き添付一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalDraftAttachmentsByDraftId(id: string) {
    try {
        const res = await fetchApprovalDraftAttachmentsByDraftId(id);
        if (!res.ok) {
            return { ok: false as const, error: "稟議書下書き添付一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalDraftAttachmentById(id: string) {
    try {
        const res = await fetchApprovalDraftAttachmentById(id);
        if (!res.ok) return { ok: false as const, error: "稟議書下書き添付の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "稟議書下書き添付が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalDraftAttachment(data: ApprovalDraftAttachmentCreateInput) {
    try {
        const res = await insertApprovalDraftAttachment(data);
        if (!res.ok) {
            return { ok: false as const, error: "稟議書下書き添付の登録に失敗しました" };
        }
        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalDraftAttachment(
    id: string,
    data: ApprovalDraftAttachmentUpdatePayload
) {
    try {
        const res = await updateApprovalDraftAttachmentById(id, data);
        if (!res.ok) { return { ok: false as const, error: "稟議書下書き添付の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalDraftAttachmentById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function deleteAttachment(
    id: string
) {
    try {
        const res = await deleteApprovalDraftAttachmentById(id);
        if (!res.ok) { return { ok: false as const, error: "稟議下書きの削除に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}


export async function deleteAttachmentByAttachmentId(
    attachment_id: string
) {
    try {
        const res = await deleteApprovalDraftAttachmentByAttachmentId(attachment_id);
        if (!res.ok) { return { ok: false as const, error: "稟議下書きの削除に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

