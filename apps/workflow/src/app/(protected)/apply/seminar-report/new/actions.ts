"use server";

import { seminarReportSchema, type SeminarReportInput } from "@/features/apply/seminar-report/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitSeminarReport(args: {
    input: SeminarReportInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: seminarReportSchema,
    });
}
