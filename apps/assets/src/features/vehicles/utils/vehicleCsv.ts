import type { VehicleExportRow } from "../repositories/vehicleExportRepository";

function escapeCsvCell(value: unknown): string {
    if (value === null || value === undefined) return "";

    const text = String(value);
    if (
        text.includes('"') ||
        text.includes(",") ||
        text.includes("\n") ||
        text.includes("\r")
    ) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

function formatDate(value: string | null): string {
    if (!value) return "";
    return value.slice(0, 10);
}

function formatDateTime(value: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    return new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

function booleanToJa(value: boolean): string {
    return value ? "要" : "不要";
}

export function buildVehiclesCsv(rows: VehicleExportRow[]): string {
    const headers = [
        "分類",
        "対象名",
        "許可番号",
        "発行日",
        "更新頻度",
        "先行許可証要否",
        "有効期限",
        "次回有効期限",
        "アラート日",
        "次回アラート日",
        "次回リマインダ日",
        "状態",
        "有効期限まで日数",
        "備考",
        "作成日時",
        "作成者",
        "更新日時",
        "更新者",
    ];

    const lines = rows.map((row) => [
        row.category_name,
        row.subject_name,
        row.registration_number,
        formatDate(row.issued_on),
        row.required_interval_label,
        booleanToJa(row.requires_prior_certificate),
        formatDate(row.expiry_on),
        formatDate(row.next_expiry_on),
        formatDate(row.alert_on),
        formatDate(row.next_alert_on),
        formatDate(row.next_reminder_on),
        row.calculated_status_name,
        row.days_until_expiry,
        row.note,
        formatDateTime(row.created_at),
        row.created_by_name,
        formatDateTime(row.updated_at),
        row.updated_by_name,
    ]);

    return [
        headers.map(escapeCsvCell).join(","),
        ...lines.map((line) => line.map(escapeCsvCell).join(",")),
    ].join("\r\n");
}
