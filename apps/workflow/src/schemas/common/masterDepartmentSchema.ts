import { z } from "zod";
import { staffDepartmentWithStaffFromDbSchema } from "./staffDepartmentSchema";
import { isBefore, startOfDay, endOfDay } from "date-fns";

/* =========================
 * 共通ベース
 * ========================= */
const masterDepartmentObject = z.object({
    code: z.string().min(1, "部門コードは必須です"),
    name: z.string().min(1, "スタッフ名は必須です"),
    kana: z.string().min(1, "カナは必須です"),
    sort_order: z.number(),
    color_code: z.string().min(1, "色コードは必須です"),
    mailing_list: z
        .email("正しいメールアドレス形式を入力してください")
        .min(1, "メールアドレスは必須です")
        .refine((val) => val.endsWith("@amarc.co.jp"), {
            message: "メールアドレスは @amarc.co.jp ドメインである必要があります",
        }),
    remarks: z.string().nullable().optional(),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterDepartmentBase = masterDepartmentObject.superRefine((val, ctx) => {
    const { valid_at, invalid_at } = val;
    if (valid_at && invalid_at) {
        // 同日OKにする場合は startOfDay / endOfDay で丸めて比較
        const start = startOfDay(valid_at);
        const end   = endOfDay(invalid_at);
        if (isBefore(end, start)) {
            ctx.addIssue({
                code: "custom",
                message: "終了日は開始日以降にしてください",
                path: ["invalid_at"], // エラー表示を invalid_at に付ける
            });
        }
    }
});

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const masterDepartmentFromDbSchema = z.object({
    id: z.uuid(),
    ...masterDepartmentBase.shape,
    memberships: z.array(staffDepartmentWithStaffFromDbSchema).default([]),
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterDepartmentType = z.infer<typeof masterDepartmentFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterDepartmentCreateSchema = masterDepartmentBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterDepartmentCreateInput = z.infer<typeof masterDepartmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterDepartmentUpdateSchema = masterDepartmentObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterDepartmentUpdateInput = z.infer<typeof masterDepartmentUpdateSchema>;

export const masterDepartmentUpdatePayloadSchema = masterDepartmentUpdateSchema.omit({ id: true });
export type MasterDepartmentUpdatePayload = z.infer<typeof masterDepartmentUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterDepartmentUpsertSchema = z.union([
    masterDepartmentCreateSchema,
    masterDepartmentUpdateSchema,
]);
export type MasterDepartmentUpsertInput = z.infer<typeof masterDepartmentUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterDepartmentUpsertInput
): v is MasterDepartmentUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
