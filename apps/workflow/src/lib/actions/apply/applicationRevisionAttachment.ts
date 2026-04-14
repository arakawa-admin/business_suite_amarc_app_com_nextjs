"use server";

import {
    ApplicationRevisionAttachmentCreateInput,
    ApplicationRevisionAttachmentUpdatePayload,
} from "@/schemas/apply/applicationRevisionAttachmentSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApplicationRevisionAttachments,
    fetchApplicationRevisionAttachmentById,
    insertApplicationRevisionAttachment,
    updateApplicationRevisionAttachmentById,
} from "@/lib/repositories/apply/applicationRevisionAttachment.repository";

export async function getApplicationRevisionAttachments() {
    try {
        const res = await fetchApplicationRevisionAttachments();
        if (!res.ok) {
            return { ok: false as const, error: "申請書改訂添付一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplicationRevisionAttachmentById(id: string) {
    try {
        const res = await fetchApplicationRevisionAttachmentById(id);
        if (!res.ok) return { ok: false as const, error: "申請書改訂添付の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書改訂添付が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApplicationRevisionAttachment(data: ApplicationRevisionAttachmentCreateInput) {
    try {
        const res = await insertApplicationRevisionAttachment(data);
        if (!res.ok) {
            return { ok: false as const, error: "申請書改訂添付の登録に失敗しました" };
        }
        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApplicationRevisionAttachment(
    id: string,
    data: ApplicationRevisionAttachmentUpdatePayload
) {
    try {
        const res = await updateApplicationRevisionAttachmentById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請書改訂添付の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplicationRevisionAttachmentById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
