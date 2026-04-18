import type { PermitExportFilterParams } from "../repositories/permitExportRepository";

export function parsePermitExportSearchParams(
    searchParams: URLSearchParams,
): PermitExportFilterParams {
    const keyword = searchParams.get("keyword");
    const categoryId = searchParams.get("categoryId");
    const statusCode = searchParams.get("statusCode");
    const includeDeleted = searchParams.get("includeDeleted") === "1";

    return {
        keyword: keyword || null,
        categoryId: categoryId || null,
        statusCode: statusCode || null,
        includeDeleted,
    };
}
