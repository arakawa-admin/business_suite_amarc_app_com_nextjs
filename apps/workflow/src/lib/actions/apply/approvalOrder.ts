"use server";

import {
    ApprovalOrderCreateInput,
    ApprovalOrderUpdatePayload,
} from "@/schemas/apply/approvalOrderSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApprovalOrders,
    fetchApprovalOrdersByApplicationId,
    fetchApprovalOrderById,
    insertApprovalOrder,
    updateApprovalOrderById,
} from "@/lib/repositories/apply/approvalOrder.repository";

export async function getApprovalOrders() {
    try {
        const res = await fetchApprovalOrders();
        if (!res.ok) {
            return { ok: false as const, error: "申請承認者一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalOrdersByApplicationId(id: string) {
    try {
        const res = await fetchApprovalOrdersByApplicationId(id);
        if (!res.ok) {
            return { ok: false as const, error: "申請承認者一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApprovalOrderById(id: string) {
    try {
        const res = await fetchApprovalOrderById(id);
        if (!res.ok) return { ok: false as const, error: "申請承認者の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請承認者が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApprovalOrder(data: ApprovalOrderCreateInput) {
    try {
        const res = await insertApprovalOrder(data);
        if (!res.ok) { return { ok: false as const, error: "申請承認者の登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApprovalOrder(
    id: string,
    data: ApprovalOrderUpdatePayload
) {
    try {
        const res = await updateApprovalOrderById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請承認者の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApprovalOrderById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
