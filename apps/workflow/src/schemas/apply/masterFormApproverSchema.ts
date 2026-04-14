import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { masterDepartmentFromDbSchema } from "@/schemas/common/masterDepartmentSchema";
import { applyFormFromDbSchema } from "@/schemas/apply/applyFormSchema";

/* =========================
 * 共通ベース
 * ========================= */
const masterFormApproverObject = z.object({
    department_id: z.uuid("部門は必須です"),
    approver_user_id: z.uuid("承認者は必須です"),
    apply_form_id: z.uuid("申請書は必須です"),
    sequence: z.number("承認順序は必須です"),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterFormApproverBase = masterFormApproverObject.superRefine((val, ctx) => {
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
export const masterFormApproverFromDbSchema = z.object({
    id: z.uuid(),
    ...masterFormApproverBase.shape,
    approver_user: masterStaffFromDbSchema,
    department: masterDepartmentFromDbSchema,
    apply_form: applyFormFromDbSchema,
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterFormApproverType = z.infer<typeof masterFormApproverFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterFormApproverCreateSchema = masterFormApproverBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterFormApproverCreateInput = z.infer<typeof masterFormApproverCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterFormApproverUpdateSchema = masterFormApproverObject
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterFormApproverUpdateInput = z.infer<typeof masterFormApproverUpdateSchema>;

export const masterFormApproverUpdatePayloadSchema = masterFormApproverUpdateSchema.omit({ id: true });
export type MasterFormApproverUpdatePayload = z.infer<typeof masterFormApproverUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterFormApproverUpsertSchema = z.union([
    masterFormApproverCreateSchema,
    masterFormApproverUpdateSchema,
]);
export type MasterFormApproverUpsertInput = z.infer<typeof masterFormApproverUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterFormApproverUpsertInput
): v is MasterFormApproverUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
