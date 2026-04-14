export function formDataToMasterCommonInput(formData: FormData) {
    return {
        code: String(formData.get("code") ?? ""),
        name: String(formData.get("name") ?? ""),
        sortOrder: String(formData.get("sortOrder") ?? "0"),
        remarks: String(formData.get("remarks") ?? ""),
        validAt: String(formData.get("validAt") ?? ""),
        invalidAt: String(formData.get("invalidAt") ?? ""),
    };
}
