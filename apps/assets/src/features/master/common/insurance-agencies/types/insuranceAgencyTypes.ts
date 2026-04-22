export type InsuranceAgency = {
    id: string;
    insuranceCategoryId: string;
    insuranceCategoryName?: string;
    insuranceCompanyName: string;
    agencyName: string | null;
    contactPersonName: string | null;
    mobilePhone: string | null;
    tel: string | null;
    fax: string | null;
    remarks: string | null;
    validAt: string | null;
    invalidAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type InsuranceAgencyFormValues = {
    insuranceCategoryId: string;
    insuranceCompanyName: string;
    agencyName: string;
    contactPersonName: string;
    mobilePhone: string;
    tel: string;
    fax: string;
    remarks: string;
    validAt: string | null;
    invalidAt: string | null;
};
export type InsuranceAgencyFormValuesRawRow = InsuranceAgencyFormValues & {
    insurance_category?: {
        id: string;
        name: string;
    } | null;
};

export type InsuranceAgencyListItem = {
    id: string;
    insuranceCategoryId: string;
    insuranceCategoryName: string;
    insuranceCompanyName: string;
    agencyName: string | null;
    contactPersonName: string | null;
    mobilePhone: string | null;
    tel: string | null;
    fax: string | null;
    remarks: string | null;
    validAt: string | null;
    invalidAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type InsuranceCategoryOption = {
    value: string;
    label: string;
};


export type InsuranceAgencyRawRow = {
    id: string;
    insurance_category_id: string;
    insurance_company_name: string;
    agency_name: string | null;
    contact_person_name: string | null;
    mobile_phone: string | null;
    tel: string | null;
    fax: string | null;
    remarks: string | null;
    valid_at: string | null;
    invalid_at: string | null;
    created_at: string;
    updated_at: string;
    insurance_category?: {
        id: string;
        name: string;
    } | null;
};
