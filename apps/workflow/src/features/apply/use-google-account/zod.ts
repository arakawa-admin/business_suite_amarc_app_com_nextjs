import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";

export const useGoogleAccountSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),

    email: z.string().min(1, "使用アカウントを入力してください").max(100, "使用アカウントは100文字以内で入力してください"),
    terminal: z.string().min(1, "端末を入力してください").max(100, "端末は100文字以内で入力してください"),
    os: z.string().min(1, "OSを入力してください").max(100, "OSは100文字以内で入力してください"),
    start_date: z.instanceof(Date, {message: "日付を入力して下さい"}),

    reason: z.string().min(1, "理由を入力してください").max(1000, "理由は1000文字以内で入力してください"),
})
;
export type UseGoogleAccountInput = z.infer<typeof useGoogleAccountSchema>;


export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: useGoogleAccountSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

