import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";
const number1dp = z.preprocess(
    (v) => {
        if (v === "" || v === null || v === undefined) return undefined;
        if (typeof v === "string" && v.trim() === "") return undefined;
        return v;
    },
    z.coerce
        .number("数字を入力して下さい")
        .int('整数で入力してください')
        .min(0, '0以上で入力してください'),
);

export const seminarReportSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),

    date: z.instanceof(Date, {message: "開催日を入力して下さい"}),
    place: z.string().min(1, "場所を入力してください").max(100, "場所は100文字以内で入力してください"),
    theme: z.string().min(1, "テーマを入力してください").max(100, "テーマは100文字以内で入力してください"),
    teacher: z.string().min(1, "講師を入力してください").max(100, "講師は100文字以内で入力してください"),

    notice_1: z.string().min(1, "勉強になったことを入力してください").max(1000, "勉強になったことは1000文字以内で入力してください"),
    notice_2: z.string().max(1000, "勉強になったことは1000文字以内で入力してください"),
    notice_3: z.string().max(1000, "勉強になったことは1000文字以内で入力してください"),
    notice_4: z.string().max(1000, "勉強になったことは1000文字以内で入力してください"),
    notice_5: z.string().max(1000, "勉強になったことは1000文字以内で入力してください"),

    todo_1: z.string().min(1, "自分で取り組むこと、会社として取り組んだ方が良いと思うことを入力してください").max(1000, "自分で取り組むこと、会社として取り組んだ方が良いと思うことは1000文字以内で入力してください"),
    todo_2: z.string().max(1000, "自分で取り組むこと、会社として取り組んだ方が良いと思うことは1000文字以内で入力してください"),
    todo_3: z.string().max(1000, "自分で取り組むこと、会社として取り組んだ方が良いと思うことは1000文字以内で入力してください"),
    todo_4: z.string().max(1000, "自分で取り組むこと、会社として取り組んだ方が良いと思うことは1000文字以内で入力してください"),
    todo_5: z.string().max(1000, "自分で取り組むこと、会社として取り組んだ方が良いと思うことは1000文字以内で入力してください"),

    remarks: z.string().max(1000, "その他何でも結構です。気づいたことがあれば入力してください。は1000文字以内で入力してください"),
    point: number1dp,

    post_files: z.array(z.object({
        file: z.instanceof(File),
        thumbnail: z.instanceof(File),
        name: z.string(),
        type: z.enum(["pdf", "image"]),
    })).optional(),
})
;
export type SeminarReportInput = z.infer<typeof seminarReportSchema>;



export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: seminarReportSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

