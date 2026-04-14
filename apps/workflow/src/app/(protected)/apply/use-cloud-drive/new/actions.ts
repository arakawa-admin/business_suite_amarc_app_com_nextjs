"use server";

import { useCloudDriveSchema, type UseCloudDriveInput } from "@/features/apply/use-cloud-drive/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitUseCloudDrive(args: {
    input: UseCloudDriveInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: useCloudDriveSchema,
    });
}

