import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApplicationType,
    ApplicationWithRevisionsType,
    ApplicationCreateInput,
    ApplicationUpdatePayload,
} from "@/schemas/apply/applicationSchema";
import { FetchResult } from "@/types/fetch-result";

type FetchApplicationsArgs = {
    // author?: string;       // UUID なら author_id
    from?: string;        // 'YYYY-MM-DD' など
    to?: string;          // 'YYYY-MM-DD' など
};

// 🔧 共通のクエリビルダー関数
function buildApplicationQuery(
    {
        // author,
        from,
        to,
    }: FetchApplicationsArgs = {},
    baseQuery: any
) {
    let query = baseQuery.select("*", { count: "exact" });

    // 文字列検索
    // if (author?.trim()) {
    //     query = query.eq("author_id", author.trim());
    // }

    // 日付検索（UTC基準で処理）
    if (from) {
        // YYYY-MM-DD 形式の簡易チェック
        if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) {
            throw new Error("from は YYYY-MM-DD 形式で指定してください");
        }
        // UTCの00:00:00として扱う
        const utcStart = new Date(`${from}T00:00:00+09:00`).toISOString();
        query = query.gte("created_at", utcStart);
    }
    if (to) {
        // YYYY-MM-DD 形式の簡易チェック
        if (!/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            throw new Error("to は YYYY-MM-DD 形式で指定してください");
        }
        // UTCの23:59:59.999として扱う
        const utcEnd = new Date(`${to}T23:59:59.999+09:00`).toISOString();
        query = query.lte("created_at", utcEnd);
    }

    return query;
}

export async function fetchApplications(args: FetchApplicationsArgs): Promise<FetchResult<ApplicationWithRevisionsType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");


    const baseQuery = apply.from("application_with_relations");
    const query = buildApplicationQuery(args, baseQuery);
    const { data, error } = await query.select(`*`);
    // const { data, error } = await apply
    //     .from("application_with_relations")
    //     .select(`*`)
    //     ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}


export async function fetchApplicationsByFormId(formId: string, args?: FetchApplicationsArgs): Promise<FetchResult<ApplicationWithRevisionsType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const baseQuery = apply.from("application_with_relations");
    const query = buildApplicationQuery(args, baseQuery);
    const { data, error } = await query
                            .select(`*`)
                            .eq("apply_form_id", formId)
                            ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplicationById(id: string): Promise<FetchResult<ApplicationWithRevisionsType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("application_with_relations")
        .select(`*`)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplicationByCode(code: string): Promise<FetchResult<ApplicationWithRevisionsType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("application_with_relations")
        .select(`*`)
        .eq("code", code)
        .maybeSingle();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApplication(
    data: ApplicationCreateInput
): Promise<FetchResult<ApplicationType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data: created, error } = await apply
        .from("applications")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApplicationById(
    id: string,
    data: ApplicationUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("applications")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
