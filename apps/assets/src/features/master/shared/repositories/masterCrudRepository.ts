import { createClient } from "@supabase-shared/server";

import { isMasterActive } from "../helpers/masterValidity";
import type {
    MasterCommonFormValues,
    MasterCommonRow,
    MasterOption,
    MasterTableName,
} from "../types/masterCommonTypes";

type MasterMapper<TRow, TFormValues> = {
    toModel: (row: Record<string, unknown>) => TRow;
    toInsertInput: (input: TFormValues) => Record<string, unknown>;
};

export async function findMasterList<
    TRow extends MasterCommonRow = MasterCommonRow,
>(
    table: MasterTableName,
    mapper: Pick<MasterMapper<TRow, never>, "toModel">,
): Promise<TRow[]> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from(table)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
    if (error) {
        throw new Error(`マスタ一覧の取得に失敗しました: ${error.message}`);
    }
    return (data ?? []).map((row) => mapper.toModel(row));
}

export async function findMasterById<
    TRow extends MasterCommonRow = MasterCommonRow,
>(
    table: MasterTableName,
    id: string,
    mapper: Pick<MasterMapper<TRow, never>, "toModel">
): Promise<TRow | null> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error(`マスタ詳細の取得に失敗しました: ${error.message}`);
    }

    return data ? mapper.toModel(data) : null;
}

export async function createMaster<
    TFormValues extends MasterCommonFormValues = MasterCommonFormValues,
>(
    table: MasterTableName,
    input: TFormValues,
    mapper: Pick<MasterMapper<never, TFormValues>, "toInsertInput">,
): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const payload = mapper.toInsertInput(input);

    const { error } = await assets.from(table).insert(payload);

    if (error) {
        throw new Error(`マスタ作成に失敗しました: ${error.message}`);
    }
}

export async function updateMaster<
    TFormValues extends MasterCommonFormValues = MasterCommonFormValues,
>(
    table: MasterTableName,
    id: string,
    input: TFormValues,
    mapper: Pick<MasterMapper<never, TFormValues>, "toInsertInput">,
): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const payload = mapper.toInsertInput(input);

    const { error } = await assets.from(table).update(payload).eq("id", id);

    if (error) {
        throw new Error(`マスタ更新に失敗しました: ${error.message}`);
    }
}

export async function findActiveMasterOptions<
    TRow extends MasterCommonRow = MasterCommonRow,
>(
    table: MasterTableName,
    mapper: Pick<MasterMapper<TRow, never>, "toModel">,
    at = new Date(),
): Promise<MasterOption[]> {
    const rows = await findMasterList(table, mapper);

    return rows
        .filter((row) => isMasterActive(row, at))
        .map((row) => ({
            value: row.id,
            label: row.name,
        }));
}
