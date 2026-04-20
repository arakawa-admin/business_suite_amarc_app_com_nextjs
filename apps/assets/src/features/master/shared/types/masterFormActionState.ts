import type { MasterCommonFormValues } from "./masterCommonTypes";

export type MasterFormFieldName = keyof MasterCommonFormValues;

export type MasterFormFieldErrors = Partial<
    Record<MasterFormFieldName, string[]>
>;

export type MasterFormActionState<
    TExtraFieldName extends string = never,
> = {
    ok: boolean;
    fieldErrors: Partial<
        Record<MasterFormFieldName | TExtraFieldName, string[]>
    >;
    formError: string | null;
};

export function createInitialMasterFormActionState<
    TExtraFieldName extends string = never,
>(): MasterFormActionState<TExtraFieldName> {
    return {
        ok: false,
        fieldErrors: {},
        formError: null,
    };
}
