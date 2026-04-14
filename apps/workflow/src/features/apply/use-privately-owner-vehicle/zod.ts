import { z } from "zod";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";
import { isBefore, startOfDay, endOfDay } from "date-fns";

export const attachmentSchema = z.object({
    file: z.instanceof(File),
    thumbnail: z.instanceof(File),
    name: z.string().min(1),
    type: z.enum(["pdf", "image"]),
});

export const usePrivatelyOwnerVehicleSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),

    is_usually: z.boolean().default(false),

    start_date: z.instanceof(Date, {message: "使用開始日を入力して下さい"}),
    end_date: z.instanceof(Date, {message: "使用終了日を入力して下さい"}),

    reason: z.string().min(1, "用途・目的を入力してください").max(1000, "用途・目的は1000文字以内で入力してください"),
    car_name: z.string().min(1, "車名を入力してください").max(100, "車名は100文字以内で入力してください"),
    car_no: z.string().min(1, "車番入力してください").max(100, "車番100文字以内で入力してください"),

    owner: z.string().min(1, "所有者を入力してください").max(100, "所有者は100文字以内で入力してください"),
    target_user_id: z.string().min(1, "使用者を選択して下さい"),

    is_liability_insurance: z.boolean().default(true),
    insurance_start_date: z.instanceof(Date, {message: "任意保険 契約開始日を入力して下さい"}),
    insurance_end_date: z.instanceof(Date, {message: "任意保険 契約終了日を入力して下さい"}),

    personal_insurance: z.string().min(1, "対人保険を選択して下さい"),
    property_insurance: z.string().min(1, "対物保険を選択して下さい"),
    passenger_insurance: z.string().min(1, "搭乗者保険を選択して下さい"),

    is_maintenance: z.boolean().default(false),
    maintenance_detail: z.string().max(100, "問題の詳細は100文字以内で入力してください").optional(),

    is_violation: z.boolean().default(false),

    license_file: z.array(attachmentSchema).optional(),
    inspection_file: z.array(attachmentSchema).optional(),
    insurance_file: z.array(attachmentSchema).optional(),
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
                    message: "使用終了日は開始日以降にしてください",
                    path: ["end_date"],
                });
            }
        }

        const { insurance_start_date, insurance_end_date } = val;
        if (insurance_start_date && insurance_end_date) {
            const start = startOfDay(insurance_start_date);
            const end = endOfDay(insurance_end_date);
            if (isBefore(end, start)) {
                ctx.addIssue({
                    code: "custom",
                    message: "任意保険 契約終了日は開始日以降にしてください",
                    path: ["insurance_end_date"],
                });
            }
        }
    };
    dateRangeRefine(val, ctx);

    if (val.is_maintenance) {
        requireNonEmpty("maintenance_detail", "整備状況がONのときは入力してください");
    }
    if (val.license_file && val.license_file.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["license_file"],
            message: "免許証を添付して下さい",
        });
    }
    if (val.inspection_file && val.inspection_file.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["inspection_file"],
            message: "車検証を添付して下さい",
        });
    }
    if (val.insurance_file && val.insurance_file.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["insurance_file"],
            message: "任意保険証を添付して下さい",
        });
    }
})
;
export type UsePrivatelyOwnerVehicleInput = z.infer<typeof usePrivatelyOwnerVehicleSchema>;



export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: usePrivatelyOwnerVehicleSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

