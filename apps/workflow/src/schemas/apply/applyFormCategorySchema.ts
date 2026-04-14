import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

/* =========================
 * 共通ベース
 * ========================= */
const applyFormCategoryObject = z.object({
    name: z.string().min(1, "ステータス名は必須です"),
    code: z.string().min(1, "コードは必須です"),
    description: z.string().nullable().optional(),
    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const applyFormCategoryBase = applyFormCategoryObject.superRefine((val, ctx) => {
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
export const applyFormCategoryFromDbSchema = z.object({
    id: z.uuid(),
    ...applyFormCategoryBase.shape,
    created_at: z.date(),
    updated_at: z.date(),
});
export type ApplyFormCategoryType = z.infer<typeof applyFormCategoryFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const applyFormCategoryCreateSchema = applyFormCategoryBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApplyFormCategoryCreateInput = z.infer<typeof applyFormCategoryCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const applyFormCategoryUpdateSchema = applyFormCategoryObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApplyFormCategoryUpdateInput = z.infer<typeof applyFormCategoryUpdateSchema>;

export const applyFormCategoryUpdatePayloadSchema = applyFormCategoryUpdateSchema.omit({ id: true });
export type ApplyFormCategoryUpdatePayload = z.infer<typeof applyFormCategoryUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const applyFormCategoryUpsertSchema = z.union([
    applyFormCategoryCreateSchema,
    applyFormCategoryUpdateSchema,
]);
export type ApplyFormCategoryUpsertInput = z.infer<typeof applyFormCategoryUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApplyFormCategoryUpsertInput
): v is ApplyFormCategoryUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
