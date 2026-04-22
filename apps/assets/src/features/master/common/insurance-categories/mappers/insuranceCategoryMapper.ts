import type {
    InsuranceCategory,
    InsuranceCategoryActionState,
} from "../types/insuranceCategoryTypes";

function emptyToNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

export function toInsuranceCategoryModel(
    row: Record<string, unknown>,
): InsuranceCategory {
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

        updateNote: String(row.update_note as string | null) ?? null,
        accidentInternalNote: String(row.accident_internal_note as string | null) ?? null,
        accidentExternalNote: String(row.accident_external_note as string | null) ?? null,
    };
}

export function toInsuranceCategoryInsertInput(
    input: InsuranceCategoryActionState,
): Record<string, unknown> {
    return {
        code: input.code.trim(),
        name: input.name.trim(),
        sort_order: input.sortOrder,
        remarks: emptyToNull(input.remarks),
        valid_at: input.validAt,
        invalid_at: emptyToNull(input.invalidAt),

        update_note: emptyToNull(input.updateNote),
        accident_internal_note: emptyToNull(input.accidentInternalNote),
        accident_external_note: emptyToNull(input.accidentExternalNote),
    };
}

export const insuranceCategoryMapper = {
    toModel: toInsuranceCategoryModel,
    toInsertInput: toInsuranceCategoryInsertInput,
};
