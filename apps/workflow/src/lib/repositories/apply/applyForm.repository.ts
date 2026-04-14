import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApplyFormType,
    ApplyFormCreateInput,
    // ApplyFormUpdateInput,
    ApplyFormUpdatePayload,
} from "@/schemas/apply/applyFormSchema";
import { FetchResult } from "@/types/fetch-result";

export async function fetchApplyForms(): Promise<FetchResult<ApplyFormType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("apply_forms")
        .select(`
            *,
            category:apply_form_categories!fk_category(*)
        `)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplyFormById(id: string): Promise<FetchResult<ApplyFormType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("apply_forms")
        .select(`
            *,
            category:apply_form_categories!fk_category(*)
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplyFormByCode(code: string): Promise<FetchResult<ApplyFormType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("apply_forms")
        .select(`
            *,
            category:apply_form_categories!fk_category(*)
        `)
        .eq("code", code)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApplyForm(
    data: ApplyFormCreateInput
): Promise<FetchResult<ApplyFormType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data: created, error } = await apply
        .from("apply_forms")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApplyFormById(
    id: string,
    data: ApplyFormUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("apply_forms")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}

// 有効化
export async function updateApplyFormInvalidAt(
    id: string,
    invalidAt: Date
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { error } = await apply
        .from("apply_forms")
        .update({ invalid_at: invalidAt })
        .eq("id", id);

    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
