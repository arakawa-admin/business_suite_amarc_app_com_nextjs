"use server";

import { useGoogleAccountSchema, type UseGoogleAccountInput } from "@/features/apply/use-google-account/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitUseGoogleAccount(args: {
    input: UseGoogleAccountInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: useGoogleAccountSchema,
    });
}
