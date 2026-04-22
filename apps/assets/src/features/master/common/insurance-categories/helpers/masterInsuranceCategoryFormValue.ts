import type {
    InsuranceCategoryActionState,
} from "../types/insuranceCategoryTypes";

export function createEmptyMasterFormValues(): InsuranceCategoryActionState {
    return {
        code: "",
        name: "",
        sortOrder: 0,
        remarks: "",
        validAt: null,
        invalidAt: null,

        updateNote: "",
        accidentInternalNote: "",
        accidentExternalNote: "",
    };
}

export function createMasterFormValuesFromRow(
    row: InsuranceCategoryActionState,
): InsuranceCategoryActionState {
    return {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
        remarks: row.remarks ?? "",
        validAt: row.validAt,
        invalidAt: row.invalidAt,

        updateNote: row.updateNote ?? "",
        accidentInternalNote: row.accidentInternalNote ?? "",
        accidentExternalNote: row.accidentExternalNote ?? "",
    };
}
