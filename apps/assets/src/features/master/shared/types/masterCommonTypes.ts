export type MasterValidityStatus = "upcoming" | "active" | "expired";

export type MasterCommonRow<TExtra extends object = Record<never, never>> = {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
    remarks: string | null;
    validAt: string | null;
    invalidAt: string | null;
    createdAt: string;
    updatedAt: string;
} & TExtra;

export type MasterCommonFormValues<TExtra extends object = Record<never, never>> = {
    code: string;
    name: string;
    sortOrder: number;
    remarks: string | null;
    validAt: string | null;
    invalidAt: string | null;
} & TExtra;

export type MasterOption = {
    value: string;
    label: string;
};

export type MasterCommonDbRow = {
    id: string;
    code: string;
    name: string;
    sort_order: number;
    remarks: string | null;
    valid_at: string | null;
    invalid_at: string | null;
    created_at: string;
    updated_at: string;
};

export type MasterCommonDbInsert = {
    code: string;
    name: string;
    sort_order: number;
    remarks: string | null;
    valid_at: string | null;
    invalid_at: string | null;
};

export type MasterTableName =
    | "master_permit_categories"
    | "master_insurance_categories"
    | "master_insurance_agencies";
