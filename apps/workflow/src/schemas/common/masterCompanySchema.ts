import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

/* =========================
 * 共通ベース
 * ========================= */
const masterCompanyObject = z.object({
    code: z.string().min(1, "部門コードは必須です"),
    name: z.string().min(1, "スタッフ名は必須です"),
    kana: z.string().min(1, "カナは必須です"),
    sort_order: z.number(),
    remarks: z.string().nullable().optional(),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterCompanyBase = masterCompanyObject.superRefine((val, ctx) => {
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
export const masterCompanyFromDbSchema = z.object({
    id: z.uuid(),
    ...masterCompanyBase.shape,
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterCompanyType = z.infer<typeof masterCompanyFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterCompanyCreateSchema = masterCompanyBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterCompanyCreateInput = z.infer<typeof masterCompanyCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterCompanyUpdateSchema = masterCompanyObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterCompanyUpdateInput = z.infer<typeof masterCompanyUpdateSchema>;

export const masterCompanyUpdatePayloadSchema = masterCompanyUpdateSchema.omit({ id: true });
export type MasterCompanyUpdatePayload = z.infer<typeof masterCompanyUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterCompanyUpsertSchema = z.union([
    masterCompanyCreateSchema,
    masterCompanyUpdateSchema,
]);
export type MasterCompanyUpsertInput = z.infer<typeof masterCompanyUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterCompanyUpsertInput
): v is MasterCompanyUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
