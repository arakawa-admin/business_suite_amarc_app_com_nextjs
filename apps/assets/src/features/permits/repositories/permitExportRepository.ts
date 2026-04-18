import { createClient } from "@supabase-shared/server";

export type PermitExportRow = {
    id: string;
    category_name: string | null;
    subject_name: string;
    business_name: string | null;
    permit_number: string | null;
    issued_on: string | null;
    required_interval_label: string | null;
    requires_prior_certificate: boolean;
    note: string | null;

    expiry_on: string | null;
    next_expiry_on: string | null;
    alert_on: string | null;
    next_alert_on: string | null;
    next_reminder_on: string | null;

    calculated_status_code: string;
    calculated_status_name: string;
    days_until_expiry: number | null;

    created_at: string;
    created_by_name: string | null;
    updated_at: string;
    updated_by_name: string | null;
};

export type PermitExportFilterParams = {
    keyword?: string | null;
    categoryId?: string | null;
    statusCode?: string | null;
    includeDeleted?: boolean;
};

export async function findPermitsForExport(
    params: PermitExportFilterParams,
): Promise<PermitExportRow[]> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    let query = assets
        .from("v_permits_list")
        .select(
            `
            id,
            category_name,
            subject_name,
            business_name,
            permit_number,
            issued_on,
            required_interval_label,
            requires_prior_certificate,
            note,
            expiry_on,
            next_expiry_on,
            alert_on,
            next_alert_on,
            next_reminder_on,
            calculated_status_code,
            calculated_status_name,
            days_until_expiry,
            created_at,
            created_by_name,
            updated_at,
            updated_by_name
            `,
        )
        .order("updated_at", { ascending: false });

    if (params.keyword?.trim()) {
        const keyword = params.keyword.trim();
        query = query.or(
            [
                `subject_name.ilike.%${keyword}%`,
                `business_name.ilike.%${keyword}%`,
                `permit_number.ilike.%${keyword}%`,
                `note.ilike.%${keyword}%`,
            ].join(","),
        );
    }

    if (params.categoryId) {
        query = query.eq("category_id", params.categoryId);
    }

    if (params.statusCode) {
        query = query.eq("calculated_status_code", params.statusCode);
    }

    if (params.includeDeleted) {
        // v_permits_list が deleted_at is null 固定なら、ここは将来拡張用。
        // 今は何もしない。
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(
            `許認可CSV出力データの取得に失敗しました: ${error.message}`,
        );
    }

    return (data ?? []) as PermitExportRow[];
}
