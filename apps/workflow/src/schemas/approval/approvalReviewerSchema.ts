import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { approvalFromDbSchema } from "@/schemas/approval/approvalSchema";

import { approvalActionFromDbSchema } from "@/schemas/approval/approvalActionSchema";

/* =========================
 * 共通ベース
 * ========================= */
const approvalReviewerBase = z.object({
    approval_id: z.uuid("稟議IDは必須です"),
    reviewer_user_id: z.uuid("回議者は必須です"),
    is_commented: z.boolean(),
    remarks: z.string().nullable().optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalReviewerFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalReviewerBase.shape,
    approval: z.lazy(() => approvalFromDbSchema),
    reviewer_user: masterStaffFromDbSchema,
    created_at: z.date(),
    updated_at: z.date(),

    actions: z.array(z.lazy(() => approvalActionFromDbSchema)).default([]),
});
export type ApprovalReviewerType = z.infer<typeof approvalReviewerFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalReviewerCreateSchema = approvalReviewerBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalReviewerCreateInput = z.infer<typeof approvalReviewerCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalReviewerUpdateSchema = approvalReviewerBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalReviewerUpdateInput = z.infer<typeof approvalReviewerUpdateSchema>;

export const approvalReviewerUpdatePayloadSchema = approvalReviewerUpdateSchema.omit({ id: true });
export type ApprovalReviewerUpdatePayload = z.infer<typeof approvalReviewerUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalReviewerUpsertSchema = z.union([
    approvalReviewerCreateSchema,
    approvalReviewerUpdateSchema,
]);
export type ApprovalReviewerUpsertInput = z.infer<typeof approvalReviewerUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalReviewerUpsertInput
): v is ApprovalReviewerUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
