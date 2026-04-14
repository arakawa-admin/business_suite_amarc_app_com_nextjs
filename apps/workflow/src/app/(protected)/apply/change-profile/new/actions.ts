"use server";

import { changeProfileSchema, type ChangeProfileInput } from "@/features/apply/change-profile/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitChangeProfile(args: {
    input: ChangeProfileInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: changeProfileSchema,
    });
}
