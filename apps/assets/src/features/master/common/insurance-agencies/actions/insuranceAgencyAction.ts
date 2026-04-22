"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
    createInsuranceAgency,
    updateInsuranceAgency,
} from "../repositories/insuranceAgencyRepository";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import type { InsuranceAgencyFormValues } from "../types/insuranceAgencyTypes";
import { insuranceAgencySchema } from "../schemas/insuranceAgencySchema";
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

export type InsuranceAgencyFormActionState =
    MasterFormActionState<AgencyFieldName>;

const initialState: InsuranceAgencyFormActionState = {
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

// const insuranceAgencySchema = z.object({
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

function buildFormValues(formData: FormData): InsuranceAgencyFormValues {
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
    error: z.ZodError<InsuranceAgencyFormValues>,
): InsuranceAgencyFormActionState["fieldErrors"] {
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

export async function createInsuranceAgencyAction(
    _prevState: InsuranceAgencyFormActionState,
    formData: FormData,
): Promise<InsuranceAgencyFormActionState> {
    const values = buildFormValues(formData);
    const parsed = insuranceAgencySchema.safeParse(values);
    const currentStaffId = await findCurrentStaffIdOrThrow();

    if (!parsed.success) {
        return {
            ok: false,
            fieldErrors: toFieldErrors(parsed.error),
            formError: "入力内容を確認してください。",
        };
    }

    try {
        await createInsuranceAgency(parsed.data, currentStaffId);
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

    redirect("/admin/common/insurance-agencies");
}

export async function updateInsuranceAgencyAction(
    id: string,
    _prevState: InsuranceAgencyFormActionState,
    formData: FormData,
): Promise<InsuranceAgencyFormActionState> {
    const values = buildFormValues(formData);
    const parsed = insuranceAgencySchema.safeParse(values);
    const currentStaffId = await findCurrentStaffIdOrThrow();

    if (!parsed.success) {
        return {
            ok: false,
            fieldErrors: toFieldErrors(parsed.error),
            formError: "入力内容を確認してください。",
        };
    }

    try {
        await updateInsuranceAgency(id, parsed.data, currentStaffId);
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

    redirect(`/admin/common/insurance-agencies/${id}`);
}

// export function createInitialInsuranceAgencyFormActionState(): InsuranceAgencyFormActionState {
//     return initialState;
// }
