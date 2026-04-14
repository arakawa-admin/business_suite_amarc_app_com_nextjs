import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { approvalFromDbSchema } from "@/schemas/approval/approvalSchema";
import { approvalActionAttachmentBase } from "@/schemas/approval/approvalActionAttachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
const approvalActionBase = z.object({
    application_id: z.uuid("申請IDは必須です"),
    // round: z.number(),
    action: z.enum(["submit", "resubmit", "approve", "reject", "return", "cancel", "reviewer_comment"]),
    actor_user_id: z.uuid("実行者は必須です"),
    order_id: z.uuid().nullable().optional(),
    comment: z.string(),
    action_at: z.date(),

    post_files: z.array(z.object({
        file: z.instanceof(File),
        thumbnail: z.instanceof(File),
        name: z.string(),
        type: z.enum(["pdf", "image"]),
    }))
    .optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalActionFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalActionBase.shape,
    approval: z.lazy(() => approvalFromDbSchema),
    actor_user: masterStaffFromDbSchema,

    attachments: z.array(approvalActionAttachmentBase).optional(),
});
export type ApprovalActionType = z.infer<typeof approvalActionFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalActionCreateSchema = approvalActionBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalActionCreateInput = z.infer<typeof approvalActionCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalActionUpdateSchema = approvalActionBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalActionUpdateInput = z.infer<typeof approvalActionUpdateSchema>;

export const approvalActionUpdatePayloadSchema = approvalActionUpdateSchema.omit({ id: true });
export type ApprovalActionUpdatePayload = z.infer<typeof approvalActionUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalActionUpsertSchema = z.union([
    approvalActionCreateSchema,
    approvalActionUpdateSchema,
]);
export type ApprovalActionUpsertInput = z.infer<typeof approvalActionUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalActionUpsertInput
): v is ApprovalActionUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
