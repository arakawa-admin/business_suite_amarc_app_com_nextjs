"use server";

import { reEmploymentSchema, type ReEmploymentInput } from "@/features/apply/re-employment/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitReEmployment(args: {
    input: ReEmploymentInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: reEmploymentSchema,
    });
}
