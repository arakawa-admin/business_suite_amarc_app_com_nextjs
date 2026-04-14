import { createClient } from "@supabase-shared/server";
import {
    toMasterCommonInsertInput,
    toMasterCommonModel,
} from "../mappers/masterCommonMapper";
import { isMasterActive } from "../helpers/masterValidity";
import type {
    MasterCommonFormValues,
    MasterCommonRow,
    MasterOption,
    MasterTableName,
} from "../types/masterCommonTypes";

export async function findMasterList(
    table: MasterTableName,
): Promise<MasterCommonRow[]> {
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

    return (data ?? []).map(toMasterCommonModel);
}

export async function findMasterById(
    table: MasterTableName,
    id: string,
): Promise<MasterCommonRow | null> {
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

    return data ? toMasterCommonModel(data) : null;
}

export async function createMaster(
    table: MasterTableName,
    input: MasterCommonFormValues,
): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const payload = toMasterCommonInsertInput(input);

    const { error } = await assets.from(table).insert(payload);

    if (error) {
        throw new Error(`マスタ作成に失敗しました: ${error.message}`);
    }
}

export async function updateMaster(
    table: MasterTableName,
    id: string,
    input: MasterCommonFormValues,
): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const payload = toMasterCommonInsertInput(input);

    const { error } = await assets.from(table).update(payload).eq("id", id);

    if (error) {
        throw new Error(`マスタ更新に失敗しました: ${error.message}`);
    }
}

export async function findActiveMasterOptions(
    table: MasterTableName,
    at = new Date(),
): Promise<MasterOption[]> {
    const rows = await findMasterList(table);

    return rows
        .filter((row) => isMasterActive(row, at))
        .map((row) => ({
            value: row.id,
            label: row.name,
        }));
}
