import type {
    MasterCommonDbInsert,
    MasterCommonDbRow,
    MasterCommonFormValues,
    MasterCommonRow,
} from "../types/masterCommonTypes";

export function toMasterCommonModel(row: MasterCommonDbRow): MasterCommonRow {
    return {
        id: row.id,
        code: row.code,
        name: row.name,
        sortOrder: row.sort_order,
        remarks: row.remarks,
        validAt: row.valid_at,
        invalidAt: row.invalid_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function toMasterCommonInsertInput(
    input: MasterCommonFormValues,
): MasterCommonDbInsert {
    return {
        code: input.code.trim(),
        name: input.name.trim(),
        sort_order: input.sortOrder,
        remarks: input.remarks ? input.remarks.trim() === "" ? null : input.remarks.trim() : null,
        valid_at: input.validAt,
        invalid_at: input.invalidAt,
    };
}

export const masterCommonMapper = {
    toModel: toMasterCommonModel,
    toInsertInput: toMasterCommonInsertInput,
};
