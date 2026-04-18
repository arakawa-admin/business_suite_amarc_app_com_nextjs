import React from "react";
import { notFound } from "next/navigation";
import { DetailPdfDocument } from "@/features/pdf/templates/DetailPdfDocument";
import { createPdfDownloadResponse } from "@/features/pdf/utils/pdfResponse";
import { formatDate, formatDateTime } from "@/features/pdf/utils/pdfDate";
import { findPermitById } from "@/features/permits/repositories/permitRepository";

export async function GET(
    _request: Request,
    context: { params: Promise<{ id: string }> },
) {
    const { id } = await context.params;
    const permit = await findPermitById(id);

    if (!permit) {
        notFound();
    }

    const document = React.createElement(DetailPdfDocument, {
        title: "許認可詳細",
        subTitle: "詳細PDF",
        sections: [
            {
                title: "基本情報",
                rows: [
                    { label: "分類", value: permit.category_name ?? "" },
                    { label: "対象名", value: permit.subject_name ?? "" },
                    { label: "事業名", value: permit.business_name ?? "" },
                    { label: "許可番号", value: permit.permit_number ?? "" },
                    { label: "発行日", value: formatDate(permit.issued_on) },
                    {
                        label: "更新頻度",
                        value: permit.required_interval_label ?? "",
                    },
                    // {
                    //     label: "状態",
                    //     value: permit.calculated_status_name ?? "",
                    // },
                ],
            },
            {
                title: "管理情報",
                rows: [
                    // { label: "有効期限", value: formatDate(permit.expiry_on) },
                    // {
                    //     label: "次回有効期限",
                    //     value: formatDate(permit.next_expiry_on),
                    // },
                    // {
                    //     label: "次回アラート日",
                    //     value: formatDate(permit.next_alert_on),
                    // },
                    {
                        label: "作成日時",
                        value: formatDateTime(permit.created_at),
                    },
                    {
                        label: "更新日時",
                        value: formatDateTime(permit.updated_at),
                    },
                ],
            },
        ],
        noteTitle: "備考",
        note: permit.note ?? "",
    });

    return createPdfDownloadResponse({
        document,
        fileName: `permit_detail_${id}.pdf`,
    });
}
