"use server";

import { usePrivatelyOwnerVehicleSchema, type UsePrivatelyOwnerVehicleInput } from "@/features/apply/use-privately-owner-vehicle/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitUsePrivatelyOwnerVehicle(args: {
    input: UsePrivatelyOwnerVehicleInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: usePrivatelyOwnerVehicleSchema,
    });
}
