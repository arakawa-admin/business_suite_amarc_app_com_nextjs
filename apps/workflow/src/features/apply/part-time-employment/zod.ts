import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";
import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { isBefore, startOfDay, endOfDay } from "date-fns";

export const postFileSchema = z.object({
    file: z.instanceof(File),
    thumbnail: z.instanceof(File),
    name: z.string(),
    type: z.enum(["pdf", "image"]),
});

export const breaktimeSchema = z.object({
    start_time: z.instanceof(Date, {message: "休憩開始時間を入力して下さい"}),
    end_time: z.instanceof(Date, {message: "休憩終了時間を入力して下さい"}),
});

export const skillSchema = z.object({
    skill_name: z.string().min(1, "技能手当名を入力して下さい"),
    attachment_revision_ids: z.array(z.string()).optional(),

    post_files: z.array(postFileSchema).default([]),
});

export const partTimeEmploymentSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),
    target_user_id: z.string().min(1, "対象者を選択して下さい"),
    target_user: masterStaffFromDbSchema.optional(),

    employ_start_date: z.instanceof(Date, {message: "雇用開始日を入力して下さい"}),
    employ_deadline_date: z.instanceof(Date, {message: "雇用満了日を入力して下さい"}),

    employ_type: z.enum(["full", "time", "other"]),
    workdays: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).default([]).optional(),
    start_worktime: z.instanceof(Date, {message: "時間を入力して下さい"}).optional(),
    end_worktime: z.instanceof(Date, {message: "時間を入力して下さい"}).optional(),
    breaktimes: z.array(breaktimeSchema).default([]),

    other_reason: z.string().max(100, "100文字以内で入力してください").optional(),

    work_place: z.string().min(1, "就業場所を入力してください").max(100, "就業場所は100文字以内で入力してください"),
    work_content: z.string().min(1, "仕事内容を入力してください").max(1000, "仕事内容は1000文字以内で入力してください"),
    health: z.string().min(1, "健康状態を入力してください").max(1000, "健康状態は1000文字以内で入力してください"),

    skills: z.array(skillSchema).default([]).optional(),
    revision_attachments: z.array(z.object()).default([]).optional(),
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
        const { start_date, end_date } = val;
        if (start_date && end_date) {
            const start = startOfDay(start_date);
            const end = endOfDay(end_date);
            if (isBefore(end, start)) {
                ctx.addIssue({
                    code: "custom",
                    message: "終了日は開始日以降にしてください",
                    path: ["end_date"],
                });
            }
        }
    };
    dateRangeRefine(val, ctx);

    if (val.employ_type === "time") {
        const workdays = val["workdays"];
        if (!workdays || workdays.length === 0) {
            ctx.addIssue({
                code: "custom",
                path: ["workdays"],
                message: "勤務日を1日以上入力してください",
            });
        }
        requireNonEmpty("start_worktime", "開始時間を入力してください");
        requireNonEmpty("end_worktime", "終了時間を入力してください");
    }

    if (val.employ_type === "other") {
        requireNonEmpty("other_reason", "その他の理由を入力してください");
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
})
;
export type PartTimeEmploymentInput = z.infer<typeof partTimeEmploymentSchema>;



export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: partTimeEmploymentSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

