import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";

const optionalNumber1dp = z.preprocess(
    (v) => {
        if (v === "" || v === null || v === undefined) return undefined;
        if (typeof v === "string" && v.trim() === "") return undefined;
        return v;
    },
    z.coerce
        .number("数字を入力して下さい")
        .multipleOf(0.1, "小数第1位までで入力してください")
        .max(1000, "1000km以内で入力してください")
        .optional()
);

export const reEmploymentSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),
    target_user_id: z.string().min(1, "対象者を選択して下さい"),

    employ_deadline: z.instanceof(Date, {message: "雇用満了日を入力して下さい"}),

    is_fulltime_days: z.boolean().default(false),
    working_days: optionalNumber1dp,

    is_fulltime_hours: z.boolean().default(false),
    working_hours: optionalNumber1dp,

    is_working_place: z.boolean().default(false),
    working_place: z.string().min(1, "希望勤務地を入力してください").max(100, "100文字以内で入力してください").optional(),

    assessment: z.string().min(1, "希望評価方法を選択してください").max(100, "100文字以内で入力してください").optional(),

    remarks: z.string().min(1, "備考を入力してください").max(1000, "備考は1000文字以内で入力してください"),

    agreeTerms: z.boolean().default(false).refine((v) => v === true, {
        message: "同意が必要です",
    }),
})
.superRefine((val, ctx) => {
    // 共通：空チェック関数
    const requireNonEmpty = (key: keyof typeof val, message: string) => {
        const v = val[key];
        const isEmpty =
            v === undefined ||
            v === null ||
            (typeof v === "string" && v.trim() === "") ||
            (typeof v === "number" && Number.isNaN(v));

        if (isEmpty) {
            ctx.addIssue({
                code: "custom",
                path: [key],
                message,
            });
        }
    };

    if (val.is_fulltime_days) {
        requireNonEmpty("working_days", "希望勤務日数を入力してください");
    }

    if (val.is_fulltime_hours) {
        requireNonEmpty("working_hours", "希望勤務時間を入力してください");
    }

    if (val.is_working_place) {
        requireNonEmpty("working_place", "希望勤務地を入力してください");
    }
});

export type ReEmploymentInput = z.infer<typeof reEmploymentSchema>;


export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: reEmploymentSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

