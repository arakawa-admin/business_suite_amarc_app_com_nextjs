import React from "react";
import { createPdfDownloadResponse } from "@/features/pdf/utils/pdfResponse";
import { findPermitsForExport } from "@/features/permits/repositories/permitExportRepository";
import { parsePermitExportSearchParams } from "@/features/permits/utils/permitExportSearchParams";
import { PermitListPdfDocument } from "@/features/permits/pdf/PermitListPdfDocument";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const filters = parsePermitExportSearchParams(url.searchParams);
    const rows = await findPermitsForExport(filters);

    const filterSummary = [
        filters.keyword ? `キーワード=${filters.keyword}` : null,
        filters.categoryId ? `分類=${filters.categoryId}` : null,
        filters.statusCode ? `状態=${filters.statusCode}` : null,
    ]
        .filter(Boolean)
        .join(" / ");

    const document = React.createElement(PermitListPdfDocument, {
        rows,
        filterSummary,
    });

    return createPdfDownloadResponse({
        document,
        fileName: "permits_list.pdf",
    });
}
