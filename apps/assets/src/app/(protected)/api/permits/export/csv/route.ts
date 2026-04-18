import { NextResponse } from "next/server";
import { findPermitsForExport } from "@/features/permits/repositories/permitExportRepository";
import { buildPermitsCsv } from "@/features/permits/utils/permitCsv";
import { parsePermitExportSearchParams } from "@/features/permits/utils/permitExportSearchParams";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const filters = parsePermitExportSearchParams(url.searchParams);

        const rows = await findPermitsForExport(filters);
        const csv = buildPermitsCsv(rows);

        const bom = "\uFEFF";
        const body = bom + csv;

        const now = new Date();
        const fileName = `permits_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.csv`;

        return new NextResponse(body, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "CSV出力に失敗しました。";

        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 },
        );
    }
}
