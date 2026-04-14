import { z } from "zod";

// import { masterStaffFromDbSchema } from "./masterStaffSchema";
// import { masterDepartmentFromDbSchema } from "./masterDepartmentSchema";
// import { isBefore, startOfDay, endOfDay } from "date-fns";

/* =========================
 * 共通ベース
 * ========================= */
const staffDepartmentBase = z.object({
    staff_id: z.uuid(),
    department_id: z.uuid(),
    remarks: z.string().nullable().optional(),
    // valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    // invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
});

// const staffDepartmentBase = staffDepartmentObject.superRefine((val, ctx) => {
//     const { valid_at, invalid_at } = val;
//     if (valid_at && invalid_at) {
//         // 同日OKにする場合は startOfDay / endOfDay で丸めて比較
//         const start = startOfDay(valid_at);
//         const end = endOfDay(invalid_at);
//         if (isBefore(end, start)) {
//             ctx.addIssue({
//                 code: "custom",
//                 message: "終了日は開始日以降にしてください",
//                 path: ["invalid_at"], // エラー表示を invalid_at に付ける
//             });
//         }
//     }
// });

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const staffDepartmentSlimFromDbSchema = z.object({
    id: z.uuid(),
    ...staffDepartmentBase.shape,
    created_at: z.date(),
    updated_at: z.date(),
});
export type StaffDepartmentSlimType = z.infer<typeof staffDepartmentSlimFromDbSchema>;

/* =========================
 * fetch(GET) 用（staff情報を含む）
 * masterDepartmentSchema.ts で使用
 * ========================= */
export const staffDepartmentWithStaffFromDbSchema = staffDepartmentSlimFromDbSchema.extend({
    staff: z.object({
        id: z.uuid(),
        login_user_id: z.uuid(),
        name: z.string(),
        kana: z.string(),
        remarks: z.string().nullable().optional(),
        valid_at: z.date().optional(),
        invalid_at: z.date().optional(),
        created_at: z.date(),
        updated_at: z.date(),
    }),
});
export type StaffDepartmentWithStaffType = z.infer<typeof staffDepartmentWithStaffFromDbSchema>;

/* =========================
 * fetch(GET) 用（department情報を含む）
 * masterStaffSchema.ts で使用する場合
 * ========================= */
export const staffDepartmentWithDepartmentFromDbSchema = staffDepartmentSlimFromDbSchema.extend({
    department: z.object({
        id: z.uuid(),
        code: z.string(),
        name: z.string(),
        kana: z.string(),
        sort_order: z.number(),
        color_code: z.string(),
        mailing_list: z.string().email(),
        remarks: z.string().nullable().optional(),
        valid_at: z.date().optional(),
        invalid_at: z.date().optional(),
        created_at: z.date(),
        updated_at: z.date(),
    }),
});
export type StaffDepartmentWithDepartmentType = z.infer<typeof staffDepartmentWithDepartmentFromDbSchema>;

export const staffDepartmentFromDbSchema = z.object({
    id: z.uuid(),
    ...staffDepartmentBase.shape,
    staff: z.object({
            id: z.uuid(),
            login_user_id: z.uuid(),
            name: z.string(),
            kana: z.string(),
            remarks: z.string().nullable().optional(),
            valid_at: z.date().optional(),
            invalid_at: z.date().optional(),
            created_at: z.date(),
            updated_at: z.date(),
        }),
    department: z.object({
            id: z.uuid(),
            code: z.string(),
            name: z.string(),
            kana: z.string(),
            sort_order: z.number(),
            color_code: z.string(),
            mailing_list: z.string().email(),
            remarks: z.string().nullable().optional(),
            valid_at: z.date().optional(),
            invalid_at: z.date().optional(),
            created_at: z.date(),
            updated_at: z.date(),
        }),
    created_at: z.date(),
    updated_at: z.date(),
});
export type StaffDepartmentType = z.infer<typeof staffDepartmentFromDbSchema>;



/* =========================
 * POST（新規登録）用
 * ========================= */
export const staffDepartmentCreateSchema = staffDepartmentBase.extend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type StaffDepartmentCreateInput = z.infer<typeof staffDepartmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const staffDepartmentUpdateSchema = staffDepartmentBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type StaffDepartmentUpdateInput = z.infer<typeof staffDepartmentUpdateSchema>;

export const staffDepartmentUpdatePayloadSchema = staffDepartmentUpdateSchema.omit({ id: true });
export type StaffDepartmentUpdatePayload = z.infer<typeof staffDepartmentUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const staffDepartmentUpsertSchema = z.union([
    staffDepartmentCreateSchema,
    staffDepartmentUpdateSchema,
]);
export type StaffDepartmentUpsertInput = z.infer<typeof staffDepartmentUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: StaffDepartmentUpsertInput
): v is StaffDepartmentUpdateInput {
    // id があれば更新とみなす
    return typeof (v as StaffDepartmentUpdateInput)?.id === "string";
}
