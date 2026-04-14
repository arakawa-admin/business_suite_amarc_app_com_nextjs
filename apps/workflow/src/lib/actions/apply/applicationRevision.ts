"use server";

import {
    ApplicationRevisionCreateInput,
    ApplicationRevisionUpdatePayload,
} from "@/schemas/apply/applicationRevisionSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApplicationRevisions,
    fetchApplicationRevisionById,
    insertApplicationRevision,
    updateApplicationRevisionById,
} from "@/lib/repositories/apply/applicationRevision.repository";

export async function getApplicationRevisions() {
    try {
        const res = await fetchApplicationRevisions();
        if (!res.ok) {
            return { ok: false as const, error: "申請書改訂一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplicationRevisionById(id: string) {
    try {
        const res = await fetchApplicationRevisionById(id);
        if (!res.ok) return { ok: false as const, error: "申請書改訂の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書改訂が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApplicationRevision(data: ApplicationRevisionCreateInput) {
    try {
        const res = await insertApplicationRevision(data);
        if (!res.ok) {
            return { ok: false as const, error: "申請書改訂の登録に失敗しました" };
        }
        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApplicationRevision(
    id: string,
    data: ApplicationRevisionUpdatePayload
) {
    try {
        const res = await updateApplicationRevisionById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請書改訂の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplicationRevisionById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
