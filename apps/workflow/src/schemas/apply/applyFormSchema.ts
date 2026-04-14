import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";
import { applyFormCategoryFromDbSchema } from "./applyFormCategorySchema";

// /* =========================
//  * JSON Schema Helper
//  * ========================= */
// // フォーム用：文字列として受け取り、オブジェクトに変換
// const jsonStringSchema = z
//     .string()
//     .min(1, "スキーマは必須です")
//     .transform((val, ctx) => {
//         try {
//             return JSON.parse(val);
//         } catch {
//             ctx.addIssue({
//                 code: "custom",
//                 message: "有効なJSON形式で入力してください",
//             });
//             return z.NEVER;
//         }
//     });

// // DB用：オブジェクトとして扱う
// const jsonObjectSchema = z.record(z.string(), z.unknown());

/* =========================
 * 共通ベース
 * ========================= */
const applyFormBaseFields = ({
    name: z.string().min(1, "ステータス名は必須です"),
    code: z.string().min(1, "コードは必須です"),
    description: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    category_id: z.uuid("カテゴリは必須です"),
    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})

// 日付バリデーション用のrefine関数
const dateRangeRefine = (val: any, ctx: z.RefinementCtx) => {
    const { valid_at, invalid_at } = val;
    if (valid_at && invalid_at) {
        const start = startOfDay(valid_at);
        const end = endOfDay(invalid_at);
        if (isBefore(end, start)) {
            ctx.addIssue({
                code: "custom",
                message: "終了日は開始日以降にしてください",
                path: ["invalid_at"],
            });
        }
    }
};

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const applyFormFromDbSchema = z
    .object({
        id: z.uuid(),
        ...applyFormBaseFields,
        // schema: jsonObjectSchema,
        category: applyFormCategoryFromDbSchema,
        created_at: z.date(),
        updated_at: z.date(),
    })
    .superRefine(dateRangeRefine);

export type ApplyFormType = z.infer<typeof applyFormFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const applyFormCreateSchema = z
    .object({
        ...applyFormBaseFields,
        // schema: jsonStringSchema, // フォームでは文字列→自動変換
        id: z.never().optional(), // create は id を受け付けない
    })
    .superRefine(dateRangeRefine);
export type ApplyFormCreateInput = z.infer<typeof applyFormCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const applyFormUpdateSchema = z
    .object({
        ...applyFormBaseFields,
        // schema: jsonStringSchema, // フォームでは文字列→自動変換
    })
    .partial()
    .extend({
        id: z.uuid(),
    })
    .superRefine(dateRangeRefine);
export type ApplyFormUpdateInput = z.infer<typeof applyFormUpdateSchema>;

export const applyFormUpdatePayloadSchema = z
    .object({
        ...applyFormBaseFields,
        // schema: jsonStringSchema,
    })
    .partial()
    .superRefine(dateRangeRefine);
    // omit() は superRefine と併用できないため、直接定義
    // applyFormUpdateSchema.omit({ id: true });
export type ApplyFormUpdatePayload = z.infer<typeof applyFormUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const applyFormUpsertSchema = z.union([
    applyFormCreateSchema,
    applyFormUpdateSchema,
]);
export type ApplyFormUpsertInput = z.infer<typeof applyFormUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApplyFormUpsertInput
): v is ApplyFormUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
