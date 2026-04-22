import type {
    InsuranceAgency,
    InsuranceAgencyFormValues,
    InsuranceAgencyRawRow
} from "../types/insuranceAgencyTypes";


function emptyToNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

export function toInsuranceAgencyModel(
    row: InsuranceAgencyRawRow,
): InsuranceAgency {
    return {
        id: String(row.id ?? ""),
        insuranceCategoryId: String(row.insurance_category_id ?? ""),
        insuranceCategoryName: String(row.insurance_category?.name ?? ""),
        insuranceCompanyName: String(row.insurance_company_name ?? ""),
        agencyName: (row.agency_name as string | null) ?? null,
        contactPersonName: (row.contact_person_name as string | null) ?? null,
        mobilePhone: (row.mobile_phone as string | null) ?? null,
        tel: (row.tel as string | null) ?? null,
        fax: (row.fax as string | null) ?? null,
        remarks: (row.remarks as string | null) ?? null,
        validAt: (row.valid_at as string | null) ?? null,
        invalidAt: (row.invalid_at as string | null) ?? null,
        createdAt: String(row.created_at ?? ""),
        updatedAt: String(row.updated_at ?? ""),
    };
}

export function toInsuranceAgencyInsertInput(
    input: InsuranceAgencyFormValues,
    currentStaffId: string,
): Record<string, unknown> {
    return {
        insurance_category_id: input.insuranceCategoryId,
        insurance_company_name: input.insuranceCompanyName.trim(),
        agency_name: emptyToNull(input.agencyName),
        contact_person_name: emptyToNull(input.contactPersonName),
        mobile_phone: emptyToNull(input.mobilePhone),
        tel: emptyToNull(input.tel),
        fax: emptyToNull(input.fax),
        remarks: emptyToNull(input.remarks),
        valid_at: input.validAt,
        invalid_at: input.invalidAt,
        created_by: currentStaffId,
        updated_by: currentStaffId,
    };
}

export function toInsuranceAgencyUpdateInput(
    input: InsuranceAgencyFormValues,
    currentStaffId: string,
): Record<string, unknown> {
    return {
        insurance_category_id: input.insuranceCategoryId,
        insurance_company_name: input.insuranceCompanyName.trim(),
        agency_name: emptyToNull(input.agencyName),
        contact_person_name: emptyToNull(input.contactPersonName),
        mobile_phone: emptyToNull(input.mobilePhone),
        tel: emptyToNull(input.tel),
        fax: emptyToNull(input.fax),
        remarks: emptyToNull(input.remarks),
        valid_at: input.validAt,
        invalid_at: input.invalidAt,
        updated_by: currentStaffId,
    };
}
