"use server";

import {
    MasterCompanyCreateInput,
    MasterCompanyUpdatePayload,
} from "@/schemas/common/masterCompanySchema";

import { subDays } from "date-fns";

import { revalidatePath } from "next/cache";

import {
    fetchMasterCompanys,
    fetchMasterCompanyById,
    fetchMasterCompanyByCode,
    insertMasterCompany,
    updateMasterCompanyById,
    updateMasterCompanyInvalidAt,
} from "@/lib/repositories/common/masterCompany.repository";

export async function getMasterCompanys() {
    try {
        const res = await fetchMasterCompanys();
        if (!res.ok) {
            return { ok: false as const, error: "会社マスタ一覧の取得に失敗しました" };
        }
        return { ok: true as const, data: res.data || [] };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterCompanyById(id: string) {
    try {
        const res = await fetchMasterCompanyById(id);
        if (!res.ok) return { ok: false as const, error: "会社マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "会社マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function getMasterCompanyByCode(code: string) {
    try {
        const res = await fetchMasterCompanyByCode(code);
        if (!res.ok) return { ok: false as const, error: "会社マスタの詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "会社マスタが見つかりません" };
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function createMasterCompany(data: MasterCompanyCreateInput) {
    try {
        const res = await insertMasterCompany(data);
        if (!res.ok) { return { ok: false as const, error: "会社マスタの登録に失敗しました" }; }

        revalidatePath("/");
        return { ok: true as const, data: res.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

export async function updateMasterCompany(
    id: string,
    data: MasterCompanyUpdatePayload
) {
    try {
        const res = await updateMasterCompanyById(id, data);
        if (!res.ok) { return { ok: false as const, error: "会社マスタの更新に失敗しました" } };

        revalidatePath("/");
        const updated = await getMasterCompanyById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data};
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 有効化
export async function enableMasterCompany(id: string) {
    try {
        const res = await updateMasterCompanyInvalidAt(id, new Date('2050-12-31'));
        if (!res.ok) { return { ok: false as const, error: "会社マスタの有効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await getMasterCompanyById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}

// 無効化
export async function disableMasterCompany(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        const res = await updateMasterCompanyInvalidAt(id, yesterday);
        if (!res.ok) { return { ok: false as const, error: "会社マスタの無効化に失敗しました" }; }

        revalidatePath("/");
        const updated = await getMasterCompanyById(id);
        if (!updated.ok) { return { ok: false as const, error: updated.error }; }
        return { ok: true as const, data: updated.data };
    } catch (e: any) {
        return { ok: false as const, error: e.message };
    }
}
