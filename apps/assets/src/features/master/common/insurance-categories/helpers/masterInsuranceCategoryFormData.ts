import { formDataToMasterCommonInput } from "@/features/master/shared/helpers/masterFormData";

export function formDataToMasterInsuranceCategoryInput(formData: FormData) {
    const commonInput = formDataToMasterCommonInput(formData);
    return {
        ...commonInput,
        updateNote: String(formData.get("updateNote") ?? ""),
        accidentInternalNote: String(formData.get("accidentInternalNote") ?? ""),
        accidentExternalNote: String(formData.get("accidentExternalNote") ?? ""),
    };
}
