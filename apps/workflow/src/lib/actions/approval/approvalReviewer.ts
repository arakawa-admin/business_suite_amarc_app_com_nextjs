"use server";

import {
    ApprovalReviewerCreateInput,
    ApprovalReviewerUpdatePayload,
} from "@/schemas/approval/approvalReviewerSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalReviewers,
    fetchApprovalReviewersByDeptId,
    fetchApprovalReviewerById,
    insertApprovalReviewer,
    updateApprovalReviewerById,
} from "@/lib/repositories/approval/approvalReviewer.repository";

export async function getApprovalReviewers() {
    try {
        const res = await fetchApprovalReviewers();
        if (!res.ok) {
            return { ok: false as const, error: "稟議回議者一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalReviewersByDeptId(deptId: string) {
    try {
        const res = await fetchApprovalReviewersByDeptId(deptId);
        if (!res.ok) {
            return { ok: false as const, error: "稟議回議者一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
export async function getApprovalReviewerById(id: string) {
    try {
        const res = await fetchApprovalReviewerById(id);
        if (!res.ok) return { ok: false as const, error: "稟議回議者の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "稟議回議者が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalReviewer(data: ApprovalReviewerCreateInput) {
    try {
        const res = await insertApprovalReviewer(data);
        if (!res.ok) { return { ok: false as const, error: "稟議回議者の登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalReviewer(
    id: string,
    data: ApprovalReviewerUpdatePayload
) {
    try {
        const res = await updateApprovalReviewerById(id, data);
        if (!res.ok) { return { ok: false as const, error: "稟議回議者の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalReviewerById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
