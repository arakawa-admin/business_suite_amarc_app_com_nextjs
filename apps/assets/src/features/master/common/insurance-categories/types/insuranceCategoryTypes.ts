import type { MasterCommonFormValues, MasterCommonRow } from "../../../shared/types/masterCommonTypes";

// type InsuranceCategoryExtraRow = {
//     update_note: string | null;
//     accident_internal_note: string | null;
//     accident_external_note: string | null;
// };
type InsuranceCategoryExtraFormValues = {
    updateNote: string;
    accidentInternalNote: string;
    accidentExternalNote: string;
};

export type InsuranceCategory = MasterCommonRow<InsuranceCategoryExtraFormValues>;
// export type InsuranceCategory = MasterCommonRow<InsuranceCategoryExtraRow>;

export type InsuranceCategoryActionState = MasterCommonFormValues<InsuranceCategoryExtraFormValues>;
