import type {
    MasterCommonFormValues,
    MasterCommonRow,
} from "../types/masterCommonTypes";

export function createEmptyMasterFormValues(): MasterCommonFormValues {
    return {
        code: "",
        name: "",
        sortOrder: 0,
        remarks: "",
        validAt: null,
        invalidAt: null,
    };
}

export function createMasterFormValuesFromRow(
    row: MasterCommonRow,
): MasterCommonFormValues {
    return {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
        remarks: row.remarks ?? "",
        validAt: row.validAt,
        invalidAt: row.invalidAt,
    };
}
