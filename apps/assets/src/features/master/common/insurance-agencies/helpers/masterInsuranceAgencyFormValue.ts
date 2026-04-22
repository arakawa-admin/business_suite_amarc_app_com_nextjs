import { format } from "date-fns";
import { ja } from "date-fns/locale";

import type {
    InsuranceAgency,
    InsuranceAgencyFormValues,
} from "../types/insuranceAgencyTypes";

export function createEmptyMasterFormValues(): InsuranceAgencyFormValues {
    return {
        insuranceCategoryId: "",
        insuranceCompanyName: "",
        agencyName: "",
        contactPersonName: "",
        mobilePhone: "",
        tel: "",
        fax: "",
        remarks: "",
        validAt: format(new Date(), "yyyy-MM-dd'T'00:00", { locale: ja }),
        invalidAt: format(new Date("2050-12-31 23:59"), "yyyy-MM-dd'T'00:00", { locale: ja }),
    };
}

export function createMasterFormValuesFromRow(
    row: InsuranceAgency,
): InsuranceAgencyFormValues {
    return {
        insuranceCategoryId: row.insuranceCategoryId || "",
        insuranceCompanyName: row.insuranceCompanyName || "",
        agencyName: row.agencyName || "",
        contactPersonName: row.contactPersonName || "",
        mobilePhone: row.mobilePhone || "",
        tel: row.tel || "",
        fax: row.fax || "",
        remarks: row.remarks || "",
        validAt: row.validAt,
        invalidAt: row.invalidAt,
    };
}
