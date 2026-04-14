import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApplyFormCategoryType,
    ApplyFormCategoryCreateInput,
    ApplyFormCategoryUpdatePayload,
} from "@/schemas/apply/applyFormCategorySchema";
import { FetchResult } from "@/types/fetch-result";

export async function fetchApplyFormCategories(): Promise<FetchResult<ApplyFormCategoryType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("apply_form_categories")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplyFormCategoryById(id: string): Promise<FetchResult<ApplyFormCategoryType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("apply_form_categories")
        .select(`*`)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplyFormCategoryByCode(code: string): Promise<FetchResult<ApplyFormCategoryType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("apply_form_categories")
        .select(`*`)
        .eq("code", code)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApplyFormCategory(
    data: ApplyFormCategoryCreateInput
): Promise<FetchResult<ApplyFormCategoryType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data: created, error } = await apply
        .from("apply_form_categories")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApplyFormCategoryById(
    id: string,
    data: ApplyFormCategoryUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("apply_form_categories")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateApplyFormCategoryInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { error } = await apply
        .from("apply_form_categories")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
