import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

/* =========================
 * 共通ベース
 * ========================= */
const masterLoginUserObject = z.object({
    // id: z.uuid().optional(),
    name: z.string().min(1, "ユーザー名は必須です"),
    email: z
        .email("正しいメールアドレス形式を入力してください")
        .min(1, "メールアドレスは必須です")
        .refine((val) => val.endsWith("@amarc.co.jp"), {
            message: "メールアドレスは @amarc.co.jp ドメインである必要があります",
        }),
    is_admin: z.boolean(),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterLoginUserBase = masterLoginUserObject
.superRefine((val, ctx) => {
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
export const masterLoginUserFromDbSchema = z.object({
    id: z.uuid(),
    ...masterLoginUserBase.shape,
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterLoginUserType = z.infer<typeof masterLoginUserFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterLoginUserCreateSchema = masterLoginUserBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterLoginUserCreateInput = z.infer<typeof masterLoginUserCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterLoginUserUpdateSchema = masterLoginUserObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterLoginUserUpdateInput = z.infer<typeof masterLoginUserUpdateSchema>;

export const masterLoginUserUpdatePayloadSchema = masterLoginUserUpdateSchema.omit({ id: true });
export type MasterLoginUserUpdatePayload = z.infer<typeof masterLoginUserUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterLoginUserUpsertSchema = z.union([
    masterLoginUserCreateSchema,
    masterLoginUserUpdateSchema,
]);
export type MasterLoginUserUpsertInput = z.infer<typeof masterLoginUserUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterLoginUserUpsertInput
): v is MasterLoginUserUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
