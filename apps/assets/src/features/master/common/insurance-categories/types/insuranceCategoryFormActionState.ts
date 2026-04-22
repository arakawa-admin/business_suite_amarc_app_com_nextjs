import type { InsuranceCategoryActionState } from "./insuranceCategoryTypes";

export type MasterFormFieldName = keyof InsuranceCategoryActionState;

export type InsuranceCategoryFormFieldErrors = Partial<
    Record<MasterFormFieldName, string[]>
>;

export type InsuranceCategoryFormActionState = {
    ok: boolean;
    fieldErrors: InsuranceCategoryFormFieldErrors;
    formError: string | null;
};
