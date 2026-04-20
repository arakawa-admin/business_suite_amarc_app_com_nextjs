import type { VehicleInsuranceCategoryActionState } from "./vehicleInsuranceCategoryTypes";

export type MasterFormFieldName = keyof VehicleInsuranceCategoryActionState;

export type VehicleInsuranceCategoryFormFieldErrors = Partial<
    Record<MasterFormFieldName, string[]>
>;

export type VehicleInsuranceCategoryFormActionState = {
    ok: boolean;
    fieldErrors: VehicleInsuranceCategoryFormFieldErrors;
    formError: string | null;
};
