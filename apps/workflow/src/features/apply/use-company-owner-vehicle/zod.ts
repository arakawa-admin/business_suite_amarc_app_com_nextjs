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
        .int('整数で入力してください')
        .min(0, '0以上で入力してください')
        .optional(),
);

export const useCompanyOwnerVehicleSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),

    start_date: z.instanceof(Date, {message: "日付を入力して下さい"}),
    end_date: z.instanceof(Date, {message: "日付を入力して下さい"}),

    destination: z.string().min(1, "行き先を入力してください").max(100, "行き先は100文字以内で入力してください"),
    reason: z.string().min(1, "用途・目的を入力してください").max(1000, "用途・目的は1000文字以内で入力してください"),
    car_name: z.string().min(1, "車名を入力してください").max(100, "車名は100文字以内で入力してください"),
    car_no: z.string().min(1, "車番入力してください").max(100, "車番100文字以内で入力してください"),

    is_maintenance: z.boolean().default(false),
    maintenance_detail: z.string().max(100, "問題の詳細は100文字以内で入力してください").optional(),

    is_violation: z.boolean().default(false),
    operation_years: optionalNumber1dp,

    post_files: z.array(z.object({
        file: z.instanceof(File),
        thumbnail: z.instanceof(File),
        name: z.string(),
        type: z.enum(["pdf", "image"]),
    })).optional(),
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

    if (val.is_maintenance) {
        requireNonEmpty("maintenance_detail", "整備状況がONのときは入力してください");
    }

    if (val.post_files && val.post_files.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["post_files"],
            message: "免許証を添付して下さい",
        });
    }
})
;
export type UseCompanyOwnerVehicleInput = z.infer<typeof useCompanyOwnerVehicleSchema>;



export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: useCompanyOwnerVehicleSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

