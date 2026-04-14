import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";
import { isBefore, startOfDay, endOfDay } from "date-fns";

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

export const postFileSchema = z.object({
    file: z.instanceof(File),
    thumbnail: z.instanceof(File),
    name: z.string(),
    type: z.enum(["pdf", "image"]),
});

export const skillSchema = z.object({
    skill_name: z.string().min(1, "技能手当名を入力して下さい"),
    attachment_revision_ids: z.array(z.string()).optional(),

    post_files: z.array(postFileSchema).default([]),
});

export const endTrialEmploymentSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),
    target_user_id: z.string().min(1, "対象者を選択して下さい"),

    employ_start_date: z.instanceof(Date, {message: "雇用開始日を入力して下さい"}),
    employ_deadline_date: z.instanceof(Date, {message: "雇用満了日を入力して下さい"}),

    trial_deadline: z.instanceof(Date, {message: "試用期間満了日を入力して下さい"}),

    interview_start_time: z.instanceof(Date, {message: "面談開始時間を入力して下さい"}).optional(),
    interview_end_time: z.instanceof(Date, {message: "面談終了時間を入力して下さい"}).optional(),

    is_perfect_attendance: z.boolean().default(false),
    absentee_days: optionalNumber1dp,
    early_leave_times: optionalNumber1dp,
    late_times: optionalNumber1dp,

    is_disaster: z.boolean().default(false),
    nonstop_disaster: optionalNumber1dp,
    hiyari_disaster: optionalNumber1dp,

    attitude: z.string().min(1, "業務遂行態度を選択してください").max(100, "業務遂行態度は100文字以内で入力してください"),
    proficiency: z.string().min(1, "作業習熟度を選択してください").max(100, "作業習熟度は100文字以内で入力してください"),
    cooperativeness: z.string().min(1, "協調性を選択してください").max(100, "協調性は100文字以内で入力してください"),

    remarks: z.string().min(1, "特記事項を入力してください").max(1000, "特記事項は1000文字以内で入力してください"),

    primary_evaluator_id: z.string().min(1, "一次評価者を選択して下さい"),
    secondary_evaluator_id: z.string().min(1, "二次評価者を選択して下さい"),

    skills: z.array(skillSchema).default([]).optional(),
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

    // 日付バリデーション用のrefine関数
    const dateRangeRefine = (val: any, ctx: z.RefinementCtx) => {
        const { employ_start_date, employ_deadline_date } = val;
        if (employ_start_date && employ_deadline_date) {
            const start = startOfDay(employ_start_date);
            const end = endOfDay(employ_deadline_date);
            if (isBefore(end, start)) {
                ctx.addIssue({
                    code: "custom",
                    message: "雇用満了日は雇用開始日以降にしてください",
                    path: ["employ_deadline_date"],
                });
            }
        }
    };
    dateRangeRefine(val, ctx);

    if (!val.is_perfect_attendance) {
        requireNonEmpty("absentee_days", "欠勤日数を入力してください");
        requireNonEmpty("early_leave_times", "早退時間を入力してください");
        requireNonEmpty("late_times", "遅刻時間を入力してください");
    }

    if (!val.is_disaster) {
        requireNonEmpty("nonstop_disaster", "不休災害を入力してください");
        requireNonEmpty("hiyari_disaster", "ヒヤリ災害を入力してください");
    }

    val.skills?.forEach((row, i) => {
        if (!row.post_files[0]?.file) {
            ctx.addIssue({
                code: "custom",
                path: ["skills", i, "post_files"],
                message: "資格証を添付して下さい",
            });
        }
    });
});

export type EndTrialEmploymentInput = z.infer<typeof endTrialEmploymentSchema>;


export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: endTrialEmploymentSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

