import { z } from "zod";
import type { VehicleInsuranceAgencyFormValues } from "../types/vehicleInsuranceAgencyTypes";

function emptyToNull(value: unknown) {
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

const nullableTrimmedString = z.preprocess(
    emptyToNull,
    z.string().trim().nullable(),
);

const requiredTrimmedString = z.string().trim().min(1, "入力してください");

export const vehicleInsuranceAgencySchema = z.object({
    insuranceCategoryId: requiredTrimmedString,
    insuranceCompanyName: requiredTrimmedString,
    agencyName: z.string().trim(),
    contactPersonName: z.string().trim(),
    mobilePhone: z.string().trim(),
    tel: z.string().trim(),
    fax: z.string().trim(),
    remarks: z.string().trim(),
    validAt: nullableTrimmedString,
    invalidAt: nullableTrimmedString,
});

export type VehicleInsuranceAgencySchemaInput = z.input<
    typeof vehicleInsuranceAgencySchema
>;

export function toVehicleInsuranceAgencyFormValues(
    input: VehicleInsuranceAgencySchemaInput,
): VehicleInsuranceAgencyFormValues {
    const parsed = vehicleInsuranceAgencySchema.parse(input);

    return {
        insuranceCategoryId: parsed.insuranceCategoryId,
        insuranceCompanyName: parsed.insuranceCompanyName,
        agencyName: parsed.agencyName,
        contactPersonName: parsed.contactPersonName,
        mobilePhone: parsed.mobilePhone,
        tel: parsed.tel,
        fax: parsed.fax,
        remarks: parsed.remarks,
        validAt: parsed.validAt,
        invalidAt: parsed.invalidAt,
    };
}
