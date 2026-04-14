"use server";

import {
    AttachmentCreateInput,
    AttachmentUpdatePayload,
} from "@/schemas/apply/attachmentSchema";

import { revalidatePath } from "next/cache";

import {
    fetchAttachments,
    fetchAttachmentById,
    insertAttachment,
    updateAttachmentById,
    deleteAttachmentById,
} from "@/lib/repositories/apply/attachment.repository";

export async function getAttachments() {
    try {
        const res = await fetchAttachments();
        if (!res.ok) {
            return { ok: false as const, error: "添付ファイル一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getAttachmentById(id: string) {
    try {
        const res = await fetchAttachmentById(id);
        if (!res.ok) return { ok: false as const, error: "添付ファイルの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "添付ファイルが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createAttachment(data: AttachmentCreateInput) {
    try {
        const res = await insertAttachment(data);
        if (!res.ok) {
            return { ok: false as const, error: "添付ファイルの登録に失敗しました" };
        }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateAttachment(
    id: string,
    data: AttachmentUpdatePayload
) {
    try {
        const res = await updateAttachmentById(id, data);
        if (!res.ok) { return { ok: false as const, error: "添付ファイルの更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchAttachmentById(id);
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
        const res = await deleteAttachmentById(id);
        if (!res.ok) { return { ok: false as const, error: "申請下書きの削除に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

