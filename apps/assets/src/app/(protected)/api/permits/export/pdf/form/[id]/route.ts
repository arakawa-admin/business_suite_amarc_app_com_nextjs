import React from "react";
import { notFound } from "next/navigation";
import { FormPdfDocument } from "@/features/pdf/templates/FormPdfDocument";
import { createPdfDownloadResponse } from "@/features/pdf/utils/pdfResponse";
import { formatDate } from "@/features/pdf/utils/pdfDate";
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

    const document = React.createElement(FormPdfDocument, {
        title: "許認可管理票",
        subTitle: "帳票PDFテンプレ",
        fields: [
            { label: "分類", value: permit.category_name ?? "" },
            { label: "対象名", value: permit.subject_name ?? "" },
            { label: "事業名", value: permit.business_name ?? "" },
            { label: "許可番号", value: permit.permit_number ?? "" },
            { label: "発行日", value: formatDate(permit.issued_on) },
            // { label: "有効期限", value: formatDate(permit.expiry_on) },
        ],
        body: permit.note ?? "",
        approvalBoxes: ["担当", "確認", "承認"],
    });

    return createPdfDownloadResponse({
        document,
        fileName: `permit_form_${id}.pdf`,
    });
}
