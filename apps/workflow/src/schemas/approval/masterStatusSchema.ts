import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

/* =========================
 * 共通ベース
 * ========================= */
const masterStatusObject = z.object({
    name: z.string().min(1, "ステータス名は必須です"),
    code: z.string().min(1, "コードは必須です"),
    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),
    // color: z.string().min(1, "カラーは必須です"),
    color: z.enum(["error", "success", "default", "primary", "secondary", "info", "warning"]),
    remarks: z.string().nullable().optional(),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterStatusBase = masterStatusObject.superRefine((val, ctx) => {
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
export const masterStatusFromDbSchema = z.object({
    id: z.uuid(),
    ...masterStatusBase.shape,
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterStatusType = z.infer<typeof masterStatusFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterStatusCreateSchema = masterStatusBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterStatusCreateInput = z.infer<typeof masterStatusCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterStatusUpdateSchema = masterStatusObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterStatusUpdateInput = z.infer<typeof masterStatusUpdateSchema>;

export const masterStatusUpdatePayloadSchema = masterStatusUpdateSchema.omit({ id: true });
export type MasterStatusUpdatePayload = z.infer<typeof masterStatusUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterStatusUpsertSchema = z.union([
    masterStatusCreateSchema,
    masterStatusUpdateSchema,
]);
export type MasterStatusUpsertInput = z.infer<typeof masterStatusUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterStatusUpsertInput
): v is MasterStatusUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
