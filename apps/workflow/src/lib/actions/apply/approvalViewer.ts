"use server";

import {
    ApprovalViewerCreateInput,
    ApprovalViewerUpdatePayload,
} from "@/schemas/apply/approvalViewerSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalViewers,
    fetchApprovalViewersByDeptId,
    fetchApprovalViewerById,
    insertApprovalViewer,
    updateApprovalViewerById,
} from "@/lib/repositories/apply/approvalViewer.repository";

export async function getApprovalViewers() {
    try {
        const res = await fetchApprovalViewers();
        if (!res.ok) {
            return { ok: false as const, error: "申請閲覧者一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalViewersByDeptId(deptId: string) {
    try {
        const res = await fetchApprovalViewersByDeptId(deptId);
        if (!res.ok) {
            return { ok: false as const, error: "申請閲覧者一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
export async function getApprovalViewerById(id: string) {
    try {
        const res = await fetchApprovalViewerById(id);
        if (!res.ok) return { ok: false as const, error: "申請閲覧者の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請閲覧者が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalViewer(data: ApprovalViewerCreateInput) {
    try {
        const res = await insertApprovalViewer(data);
        if (!res.ok) { return { ok: false as const, error: "申請閲覧者の登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalViewer(
    id: string,
    data: ApprovalViewerUpdatePayload
) {
    try {
        const res = await updateApprovalViewerById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請閲覧者の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalViewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
