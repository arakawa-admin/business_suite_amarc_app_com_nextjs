import "server-only";
import { createClient } from "@supabase-shared/server";

import {
    ApplicationRevisionType,
    ApplicationRevisionCreateInput,
    ApplicationRevisionUpdatePayload,
} from "@/schemas/apply/applicationRevisionSchema";

import { FetchResult } from "@/types/fetch-result";

export async function fetchApplicationRevisions(): Promise<FetchResult<ApplicationRevisionType[]>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("application_revisions")
        .select(`*`)
        ;
    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function fetchApplicationRevisionById(id: string): Promise<FetchResult<ApplicationRevisionType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const { data, error } = await apply
        .from("application_revisions")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error) {
        return { ok: false, error: `DB fetch failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data };
}

export async function insertApplicationRevision(
    data: ApplicationRevisionCreateInput
): Promise<FetchResult<ApplicationRevisionType>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");
    const { data: created, error } = await apply
        .from("application_revisions")
        .insert(data)
        .select("*")
        .single();
    if (error) {
        return { ok: false, error: `DB create failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: created };
}

export async function updateApplicationRevisionById(
    id: string,
    data: ApplicationRevisionUpdatePayload
): Promise<FetchResult<void>> {
    const supabase = await createClient();
    const apply = supabase.schema("apply");

    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { error } = await apply
        .from("application_revisions")
        .update(payload)
        .eq("id", id);
    if (error) {
        return { ok: false, error: `DB update failed: ${error.code} ${error.message}` };
    }
    return { ok: true, data: undefined };
}
