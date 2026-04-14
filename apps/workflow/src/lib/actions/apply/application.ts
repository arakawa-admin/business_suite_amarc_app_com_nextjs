"use server";

import {
    ApplicationCreateInput,
    ApplicationUpdatePayload,
} from "@/schemas/apply/applicationSchema";

import { revalidatePath } from "next/cache";

import {
    fetchApplications,
    fetchApplicationsByFormId,
    fetchApplicationById,
    fetchApplicationByCode,
    insertApplication,
    updateApplicationById,
} from "@/lib/repositories/apply/application.repository";
import { getMasterStatusByCode } from "@/lib/actions/apply/masterStatus";

type GetApplicationsArgs = {
    // author?: string;       // UUID なら author_id
    from?: string;        // 'YYYY-MM-DD' など
    to?: string;          // 'YYYY-MM-DD' など
};

export async function getApplications(args: GetApplicationsArgs) {
    try {
        const res = await fetchApplications(args);
        if (!res.ok) {
            return { ok: false as const, error: "申請書一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplicationsByFormId(formId: string, args: GetApplicationsArgs = {}) {
    try {
        const res = await fetchApplicationsByFormId(formId, args);
        if (!res.ok) {
            return { ok: false as const, error: "申請書一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplicationById(id: string) {
    try {
        const res = await fetchApplicationById(id);
        if (!res.ok) return { ok: false as const, error: "申請書の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getApplicationByCode(code: string) {
    try {
        const res = await fetchApplicationByCode(code);
        if (!res.ok) return { ok: false as const, error: "申請書の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書が見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createApplication(data: ApplicationCreateInput) {
    try {
        const res = await insertApplication(data);
        if (!res.ok) { return { ok: false as const, error: "申請書の登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateApplication(
    id: string,
    data: ApplicationUpdatePayload
) {
    try {
        const res = await updateApplicationById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請書の更新に失敗しました" }; }

        revalidatePath("/");
        const updated = await fetchApplicationById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function cancelApplicationById(
    id: string
) {
    try {
        const cancelled_status_id = await getMasterStatusByCode("cancelled").then((res) => res.data?.id)
        if(!cancelled_status_id) return { ok: false as const, error: "取消ステータスを取得できません" }

        const data = {
            status_id: cancelled_status_id,
            completed_at: new Date(),
        }
        const res = await updateApplicationById(id, data);
        if (!res.ok) { return { ok: false as const, error: "申請書の取り下げに失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: undefined };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

