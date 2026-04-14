import { z } from "zod";

export const softDeletePermitSchema = z.object({
    permitId: z.uuid(),
    deleteReason: z
        .string()
        .trim()
        .max(500, "削除理由は500文字以内で入力してください。")
        .transform((v) => (v && v.length > 0 ? v : "")),
});

export type SoftDeletePermitFormValues = z.infer<typeof softDeletePermitSchema>;
