import type { MasterCommonFormValues } from "./masterCommonTypes";

export type MasterFormFieldName = keyof MasterCommonFormValues;

export type MasterFormFieldErrors = Partial<
    Record<MasterFormFieldName, string[]>
>;

export type MasterFormActionState = {
    ok: boolean;
    fieldErrors: MasterFormFieldErrors;
    formError: string | null;
};
