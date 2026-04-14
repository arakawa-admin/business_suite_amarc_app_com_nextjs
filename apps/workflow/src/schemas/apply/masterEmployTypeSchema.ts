import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

/* =========================
 * 共通ベース
 * ========================= */
const masterEmployTypeObject = z.object({
    name: z.string().min(1, "ステータス名は必須です"),
    code: z.string().min(1, "コードは必須です"),
    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),
    remarks: z.string().nullable().optional(),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterEmployTypeBase = masterEmployTypeObject.superRefine((val, ctx) => {
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
export const masterEmployTypeFromDbSchema = z.object({
    id: z.uuid(),
    ...masterEmployTypeBase.shape,
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterEmployType = z.infer<typeof masterEmployTypeFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterEmployTypeCreateSchema = masterEmployTypeBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterEmployTypeCreateInput = z.infer<typeof masterEmployTypeCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterEmployTypeUpdateSchema = masterEmployTypeObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterEmployTypeUpdateInput = z.infer<typeof masterEmployTypeUpdateSchema>;

export const masterEmployTypeUpdatePayloadSchema = masterEmployTypeUpdateSchema.omit({ id: true });
export type MasterEmployTypeUpdatePayload = z.infer<typeof masterEmployTypeUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterEmployTypeUpsertSchema = z.union([
    masterEmployTypeCreateSchema,
    masterEmployTypeUpdateSchema,
]);
export type MasterEmployTypeUpsertInput = z.infer<typeof masterEmployTypeUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterEmployTypeUpsertInput
): v is MasterEmployTypeUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
