"use server";

import { useCompanyOwnerVehicleSchema, type UseCompanyOwnerVehicleInput } from "@/features/apply/use-company-owner-vehicle/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitUseCompanyOwnerVehicle(args: {
    input: UseCompanyOwnerVehicleInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: useCompanyOwnerVehicleSchema,
    });
}
