import React from "react";
import { ListPdfDocument, type ListPdfColumn } from "@/features/pdf/templates/ListPdfDocument";
import type { PermitExportRow } from "@/features/permits/repositories/permitExportRepository";
import { formatDate } from "@/features/pdf/utils/pdfDate";

export function PermitListPdfDocument({
    rows,
    filterSummary,
}: {
    rows: PermitExportRow[];
    filterSummary?: string;
}) {
    const columns: ListPdfColumn<PermitExportRow>[] = [
        {
            key: "category_name",
            label: "分類",
            width: "18%",
            render: (row) => row.category_name ?? "",
        },
        {
            key: "subject_name",
            label: "対象名",
            width: "24%",
            render: (row) => row.subject_name,
        },
        {
            key: "business_name",
            label: "事業名",
            width: "18%",
            render: (row) => row.business_name ?? "",
        },
        {
            key: "permit_number",
            label: "許可番号",
            width: "14%",
            render: (row) => row.permit_number ?? "",
        },
        {
            key: "expiry_on",
            label: "有効期限",
            width: "12%",
            render: (row) => formatDate(row.expiry_on),
        },
        {
            key: "status",
            label: "状態",
            width: "14%",
            render: (row) => row.calculated_status_name,
        },
    ];

    return (
        <ListPdfDocument<PermitExportRow>
            title="許認可一覧"
            subTitle="一覧PDF"
            filterSummary={filterSummary}
            rows={rows}
            columns={columns}
        />
    );
}
