import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";

export const postFileSchema = z.object({
    file: z.instanceof(File),
    thumbnail: z.instanceof(File),
    name: z.string(),
    type: z.enum(["pdf", "image"]),
});

export const skillSchema = z.object({
    is_add: z.boolean().default(true),
    applicable_month: z.instanceof(Date, { message: "適用月を入力して下さい" }),
    skill_name: z.string().min(1, "技能手当名を入力して下さい"),
    attachment_revision_ids: z.array(z.string()).optional(),

    post_files: z.array(postFileSchema).default([]),
});

export const qualificationCompensationSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),

    reason: z.string().min(1, "理由を入力してください").max(1000, "理由は1000文字以内で入力してください"),

    skills: z.array(skillSchema).default([]).optional(),
    _skipSkillsValidation: z.boolean().optional(), // バリデーションをスキップするためのフラグ サーバコンポーネント用
})
.superRefine((val, ctx) => {
    if (val._skipSkillsValidation) return;
    if (!val.skills || val.skills.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["skills"],
            message: "技能手当を1件以上入力してください",
        });
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

export type QualificationCompensationInput = z.infer<typeof qualificationCompensationSchema>;


export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: qualificationCompensationSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

