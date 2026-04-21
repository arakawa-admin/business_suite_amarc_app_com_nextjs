export type VehicleInsuranceAgency = {
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

export type VehicleInsuranceAgencyFormValues = {
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
export type VehicleInsuranceAgencyFormValuesRawRow = VehicleInsuranceAgencyFormValues & {
    insurance_category?: {
        id: string;
        name: string;
    } | null;
};

export type VehicleInsuranceAgencyListItem = {
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

export type VehicleInsuranceCategoryOption = {
    value: string;
    label: string;
};


export type VehicleInsuranceAgencyRawRow = {
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
