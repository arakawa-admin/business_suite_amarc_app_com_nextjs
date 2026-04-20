import type { MasterCommonFormValues, MasterCommonRow } from "../../../shared/types/masterCommonTypes";

// type VehicleInsuranceCategoryExtraRow = {
//     update_note: string | null;
//     accident_internal_note: string | null;
//     accident_external_note: string | null;
// };
type VehicleInsuranceCategoryExtraFormValues = {
    updateNote: string;
    accidentInternalNote: string;
    accidentExternalNote: string;
};

export type VehicleInsuranceCategory = MasterCommonRow<VehicleInsuranceCategoryExtraFormValues>;
// export type VehicleInsuranceCategory = MasterCommonRow<VehicleInsuranceCategoryExtraRow>;

export type VehicleInsuranceCategoryActionState = MasterCommonFormValues<VehicleInsuranceCategoryExtraFormValues>;
