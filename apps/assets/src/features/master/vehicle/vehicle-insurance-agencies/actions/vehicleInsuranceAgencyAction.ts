"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
    createVehicleInsuranceAgency,
    updateVehicleInsuranceAgency,
} from "../repositories/vehicleInsuranceAgencyRepository";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import type { VehicleInsuranceAgencyFormValues } from "../types/vehicleInsuranceAgencyTypes";
import { vehicleInsuranceAgencySchema } from "../schemas/vehicleInsuranceAgencySchema";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

type AgencyFieldName =
    | "insuranceCategoryId"
    | "insuranceCompanyName"
    | "agencyName"
    | "contactPersonName"
    | "mobilePhone"
    | "tel"
    | "fax"
    | "remarks"
    | "validAt"
    | "invalidAt";

export type VehicleInsuranceAgencyFormActionState =
    MasterFormActionState<AgencyFieldName>;

const initialState: VehicleInsuranceAgencyFormActionState = {
    ok: false,
    fieldErrors: {},
    formError: null,
};

function emptyToNull(value: FormDataEntryValue | null): string | null {
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

function toStringValue(value: FormDataEntryValue | null): string {
    return typeof value === "string" ? value.trim() : "";
}

// const vehicleInsuranceAgencySchema = z.object({
//     insuranceCategoryId: z.string().trim().min(1, "保険カテゴリを選択してください。"),
//     insuranceCompanyName: z.string().trim().min(1, "保険会社名を入力してください。"),
//     agencyName: z.string().trim(),
//     contactPersonName: z.string().trim(),
//     mobilePhone: z.string().trim(),
//     tel: z.string().trim(),
//     fax: z.string().trim(),
//     remarks: z.string().trim(),
//     validAt: z.string().trim().nullable(),
//     invalidAt: z.string().trim().nullable(),
// });

function buildFormValues(formData: FormData): VehicleInsuranceAgencyFormValues {
    return {
        insuranceCategoryId: toStringValue(formData.get("insuranceCategoryId")),
        insuranceCompanyName: toStringValue(formData.get("insuranceCompanyName")),
        agencyName: toStringValue(formData.get("agencyName")),
        contactPersonName: toStringValue(formData.get("contactPersonName")),
        mobilePhone: toStringValue(formData.get("mobilePhone")),
        tel: toStringValue(formData.get("tel")),
        fax: toStringValue(formData.get("fax")),
        remarks: toStringValue(formData.get("remarks")),
        validAt: emptyToNull(formData.get("validAt")),
        invalidAt: emptyToNull(formData.get("invalidAt")),
    };
}

function toFieldErrors(
    error: z.ZodError<VehicleInsuranceAgencyFormValues>,
): VehicleInsuranceAgencyFormActionState["fieldErrors"] {
    const flattened = error.flatten().fieldErrors;

    return {
        insuranceCategoryId: flattened.insuranceCategoryId,
        insuranceCompanyName: flattened.insuranceCompanyName,
        agencyName: flattened.agencyName,
        contactPersonName: flattened.contactPersonName,
        mobilePhone: flattened.mobilePhone,
        tel: flattened.tel,
        fax: flattened.fax,
        remarks: flattened.remarks,
        validAt: flattened.validAt,
        invalidAt: flattened.invalidAt,
    };
}

export async function createVehicleInsuranceAgencyAction(
    _prevState: VehicleInsuranceAgencyFormActionState,
    formData: FormData,
): Promise<VehicleInsuranceAgencyFormActionState> {
    const values = buildFormValues(formData);
    const parsed = vehicleInsuranceAgencySchema.safeParse(values);
    const currentStaffId = await findCurrentStaffIdOrThrow();

    if (!parsed.success) {
        return {
            ok: false,
            fieldErrors: toFieldErrors(parsed.error),
            formError: "入力内容を確認してください。",
        };
    }

    try {
        await createVehicleInsuranceAgency(parsed.data, currentStaffId);
    } catch (error) {
        return {
            ok: false,
            fieldErrors: {},
            formError:
                error instanceof Error
                    ? error.message
                    : "保険契約先の作成に失敗しました。",
        };
    }

    redirect("/admin/vehicle/vehicle-insurance-agencies");
}

export async function updateVehicleInsuranceAgencyAction(
    id: string,
    _prevState: VehicleInsuranceAgencyFormActionState,
    formData: FormData,
): Promise<VehicleInsuranceAgencyFormActionState> {
    const values = buildFormValues(formData);
    const parsed = vehicleInsuranceAgencySchema.safeParse(values);
    const currentStaffId = await findCurrentStaffIdOrThrow();

    if (!parsed.success) {
        return {
            ok: false,
            fieldErrors: toFieldErrors(parsed.error),
            formError: "入力内容を確認してください。",
        };
    }

    try {
        await updateVehicleInsuranceAgency(id, parsed.data, currentStaffId);
    } catch (error) {
        return {
            ok: false,
            fieldErrors: {},
            formError:
                error instanceof Error
                    ? error.message
                    : "保険契約先の更新に失敗しました。",
        };
    }

    redirect(`/admin/vehicle/vehicle-insurance-agencies/${id}`);
}

// export function createInitialVehicleInsuranceAgencyFormActionState(): VehicleInsuranceAgencyFormActionState {
//     return initialState;
// }
