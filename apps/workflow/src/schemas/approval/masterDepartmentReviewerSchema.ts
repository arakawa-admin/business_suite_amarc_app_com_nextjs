import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { masterDepartmentFromDbSchema } from "@/schemas/common/masterDepartmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
const masterDepartmentReviewerObject = z.object({
    department_id: z.uuid("部門は必須です"),
    reviewer_user_id: z.uuid("回議者は必須です"),
    remarks: z.string().nullable().optional(),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterDepartmentReviewerBase = masterDepartmentReviewerObject.superRefine((val, ctx) => {
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
export const masterDepartmentReviewerFromDbSchema = z.object({
    id: z.uuid(),
    ...masterDepartmentReviewerBase.shape,
    reviewer_user: masterStaffFromDbSchema,
    department: masterDepartmentFromDbSchema,
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterDepartmentReviewerType = z.infer<typeof masterDepartmentReviewerFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterDepartmentReviewerCreateSchema = masterDepartmentReviewerBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterDepartmentReviewerCreateInput = z.infer<typeof masterDepartmentReviewerCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterDepartmentReviewerUpdateSchema = masterDepartmentReviewerObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterDepartmentReviewerUpdateInput = z.infer<typeof masterDepartmentReviewerUpdateSchema>;

export const masterDepartmentReviewerUpdatePayloadSchema = masterDepartmentReviewerUpdateSchema.omit({ id: true });
export type MasterDepartmentReviewerUpdatePayload = z.infer<typeof masterDepartmentReviewerUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterDepartmentReviewerUpsertSchema = z.union([
    masterDepartmentReviewerCreateSchema,
    masterDepartmentReviewerUpdateSchema,
]);
export type MasterDepartmentReviewerUpsertInput = z.infer<typeof masterDepartmentReviewerUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterDepartmentReviewerUpsertInput
): v is MasterDepartmentReviewerUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
