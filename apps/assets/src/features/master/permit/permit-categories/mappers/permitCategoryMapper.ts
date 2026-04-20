import type {
    PermitCategory,
    PermitCategoryFormValues,
} from "../types/permitCategoryTypes";

function emptyToNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

export function toPermitCategoryModel(
    row: Record<string, unknown>,
): PermitCategory {
    return {
        id: String(row.id ?? ""),
        code: String(row.code ?? ""),
        name: String(row.name ?? ""),
        sortOrder: Number(row.sort_order ?? 0),
        remarks: (row.remarks as string | null) ?? null,
        validAt: (row.valid_at as string | null) ?? null,
        invalidAt: (row.invalid_at as string | null) ?? null,
        createdAt: String(row.created_at ?? ""),
        updatedAt: String(row.updated_at ?? ""),
    };
}

export function toPermitCategoryInsertInput(
    input: PermitCategoryFormValues,
): Record<string, unknown> {
    return {
        code: input.code.trim(),
        name: input.name.trim(),
        sort_order: input.sortOrder,
        remarks: emptyToNull(input.remarks),
        valid_at: input.validAt,
        invalid_at: emptyToNull(input.invalidAt),
    };
}

export const permitCategoryMapper = {
    toModel: toPermitCategoryModel,
    toInsertInput: toPermitCategoryInsertInput,
};
