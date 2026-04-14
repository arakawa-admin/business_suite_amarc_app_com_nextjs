import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { approvalActionFromDbSchema } from "@/schemas/approval/approvalActionSchema";
import { attachmentFromDbSchema } from "@/schemas/approval/attachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
export const approvalActionAttachmentBase = z.object({
    approval_action_id: z.uuid("稟議版IDは必須です"),
    attachment_id: z.uuid("ファイルIDは必須です"),

    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),

    added_by: z.uuid("追加ユーザIDは必須です"),
    added_at: z.date(),

    attachment: attachmentFromDbSchema.optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalActionAttachmentFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalActionAttachmentBase.shape,
    approvalAction: z.lazy(() => approvalActionFromDbSchema),
    added_user: masterStaffFromDbSchema,
});
export type ApprovalActionAttachmentType = z.infer<typeof approvalActionAttachmentFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalActionAttachmentCreateSchema = approvalActionAttachmentBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalActionAttachmentCreateInput = z.infer<typeof approvalActionAttachmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalActionAttachmentUpdateSchema = approvalActionAttachmentBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalActionAttachmentUpdateInput = z.infer<typeof approvalActionAttachmentUpdateSchema>;

export const approvalActionAttachmentUpdatePayloadSchema = approvalActionAttachmentUpdateSchema.omit({ id: true });
export type ApprovalActionAttachmentUpdatePayload = z.infer<typeof approvalActionAttachmentUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalActionAttachmentUpsertSchema = z.union([
    approvalActionAttachmentCreateSchema,
    approvalActionAttachmentUpdateSchema,
]);
export type ApprovalActionAttachmentUpsertInput = z.infer<typeof approvalActionAttachmentUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalActionAttachmentUpsertInput
): v is ApprovalActionAttachmentUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
