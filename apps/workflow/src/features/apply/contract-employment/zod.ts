import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";
import { isBefore, startOfDay, endOfDay } from "date-fns";

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

export const contractEmploymentSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),
    target_user_id: z.string().min(1, "対象者を選択して下さい"),

    employ_start_date: z.instanceof(Date, {message: "雇用開始日を入力して下さい"}),
    employ_deadline_date: z.instanceof(Date, {message: "雇用満了日を入力して下さい"}),

    work_place: z.string().min(1, "就業場所を入力してください").max(100, "就業場所は100文字以内で入力してください"),
    work_content: z.string().min(1, "仕事内容を入力してください").max(1000, "仕事内容は1000文字以内で入力してください"),
    health: z.string().min(1, "健康状態を入力してください").max(1000, "健康状態は1000文字以内で入力してください"),

    skills: z.array(skillSchema).default([]).optional(),
})
.superRefine((val, ctx) => {
    // 日付バリデーション用のrefine関数
    const dateRangeRefine = (val: any, ctx: z.RefinementCtx) => {
        const { employ_start_date, employ_deadline_date } = val;
        if (employ_start_date && employ_deadline_date) {
            const start = startOfDay(employ_start_date);
            const end = endOfDay(employ_deadline_date);
            if (isBefore(end, start)) {
                ctx.addIssue({
                    code: "custom",
                    message: "終了日は開始日以降にしてください",
                    path: ["employ_deadline_date"],
                });
            }
        }
    };
    dateRangeRefine(val, ctx);

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
export type ContractEmploymentInput = z.infer<typeof contractEmploymentSchema>;



export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: contractEmploymentSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

