import { createClient } from "@supabase-shared/server";
import type {
    InsuranceAgency,
    InsuranceAgencyFormValues,
    InsuranceAgencyListItem,
    InsuranceCategoryOption,
} from "../types/insuranceAgencyTypes";
import { toInsuranceAgencyModel, toInsuranceAgencyInsertInput, toInsuranceAgencyUpdateInput } from "../mappers/insuranceAgencyMapper";

const TABLE = "master_insurance_agencies" as const;

export async function findInsuranceAgencyList(): Promise<
    InsuranceAgencyListItem[]
> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from(TABLE)
        .select(`
            *,
            insurance_category:master_insurance_categories!inner(
                id,
                name,
                code
            )
        `)
        // .eq("master_insurance_categories.code", "vehicle_insurance")
        .order("insurance_company_name", { ascending: true })
        .order("agency_name", { ascending: true });

    if (error) {
        throw new Error(`保険契約先一覧の取得に失敗しました: ${error.message}`);
    }

    return (data ?? []).map((row) => {
        const item = toInsuranceAgencyModel(row);
        const insuranceCategory = (row as Record<string, unknown>)
            .insurance_category as
            | { id?: string; name?: string }
            | null
            | undefined;

        return {
            ...item,
            insuranceCategoryName: insuranceCategory?.name ?? "",
        };
    });
}

export async function findInsuranceAgencyById(
    id: string,
): Promise<InsuranceAgency | null> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from(TABLE)
        .select(`
            *,
            insurance_category:master_insurance_categories(
                id,
                name
            )
        `)
        .eq("id", id)
        .maybeSingle();
    if (error) {
        throw new Error(`保険契約先詳細の取得に失敗しました: ${error.message}`);
    }

    return data ? toInsuranceAgencyModel(data) : null;
}

export async function createInsuranceAgency(
    input: InsuranceAgencyFormValues,
    currentStaffId: string,
): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const payload = toInsuranceAgencyInsertInput(input, currentStaffId);

    const { error } = await assets.from(TABLE).insert(payload);

    if (error) {
        throw new Error(`保険契約先の作成に失敗しました: ${error.message}`);
    }
}

export async function updateInsuranceAgency(
    id: string,
    input: InsuranceAgencyFormValues,
    currentStaffId: string,
): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const payload = toInsuranceAgencyUpdateInput(input, currentStaffId);

    const { error } = await assets.from(TABLE).update(payload).eq("id", id);

    if (error) {
        throw new Error(`保険契約先の更新に失敗しました: ${error.message}`);
    }
}

export async function findActiveInsuranceCategoryOptions(): Promise<
    InsuranceCategoryOption[]
> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const nowIso = new Date().toISOString();

    const { data, error } = await assets
        .from("master_insurance_categories")
        .select("id, name")
        .lte("valid_at", nowIso)
        .or(`invalid_at.is.null,invalid_at.gt.${nowIso}`)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        throw new Error(`保険カテゴリ選択肢の取得に失敗しました: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
        value: String(row.id),
        label: String(row.name),
    }));
}
