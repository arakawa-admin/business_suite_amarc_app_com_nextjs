import { z } from "zod";

export const createCommentSchema = z.object({
    targetType: z.enum(["vehicle", "reminder"]),
    targetId: z.uuid("対象IDが不正です"),
    // commentTypeCode: z.enum(["memo", "comment", "reminder_response"]),
    body: z
        .string()
        .trim()
        .min(1, "コメントを入力してください")
        .max(2000, "コメントは2000文字以内で入力してください"),
    sourceType: z
        .enum(["detail", "email_link", "manual"])
        .nullable()
        .optional(),
    // reminderId: z.uuid().nullable().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
