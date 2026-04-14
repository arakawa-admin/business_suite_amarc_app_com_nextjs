import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
// import { approvalRevisionFromDbSchema } from "@/schemas/approval/approvalRevisionSchema";
import { attachmentFromDbSchema } from "@/schemas/approval/attachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
export const approvalRevisionAttachmentBase = z.object({
    approval_revision_id: z.uuid("稟議版IDは必須です"),
    attachment_id: z.uuid("ファイルIDは必須です"),
    role: z.string().nullable().optional(),
    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),

    added_by: z.uuid("追加ユーザIDは必須です"),
    added_at: z.date(),

    attachment: attachmentFromDbSchema.optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalRevisionAttachmentFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalRevisionAttachmentBase.shape,
    // approvalRevision: z.lazy(() => approvalRevisionFromDbSchema),
    added_user: masterStaffFromDbSchema,
});
export type ApprovalRevisionAttachmentType = z.infer<typeof approvalRevisionAttachmentFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalRevisionAttachmentCreateSchema = approvalRevisionAttachmentBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalRevisionAttachmentCreateInput = z.infer<typeof approvalRevisionAttachmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalRevisionAttachmentUpdateSchema = approvalRevisionAttachmentBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalRevisionAttachmentUpdateInput = z.infer<typeof approvalRevisionAttachmentUpdateSchema>;

export const approvalRevisionAttachmentUpdatePayloadSchema = approvalRevisionAttachmentUpdateSchema.omit({ id: true });
export type ApprovalRevisionAttachmentUpdatePayload = z.infer<typeof approvalRevisionAttachmentUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalRevisionAttachmentUpsertSchema = z.union([
    approvalRevisionAttachmentCreateSchema,
    approvalRevisionAttachmentUpdateSchema,
]);
export type ApprovalRevisionAttachmentUpsertInput = z.infer<typeof approvalRevisionAttachmentUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalRevisionAttachmentUpsertInput
): v is ApprovalRevisionAttachmentUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
