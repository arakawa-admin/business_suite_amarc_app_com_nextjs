import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { approvalDraftFromDbSchema } from "@/schemas/approval/approvalDraftSchema";
import { attachmentFromDbSchema } from "@/schemas/approval/attachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
export const approvalDraftAttachmentBase = z.object({
    approval_draft_id: z.uuid("稟議下書きIDは必須です"),
    attachment_id: z.uuid("ファイルIDは必須です"),

    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),

    added_by: z.uuid("追加ユーザIDは必須です"),
    added_at: z.date(),

    attachment: attachmentFromDbSchema.optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalDraftAttachmentFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalDraftAttachmentBase.shape,
    approvalDraft: z.lazy(() => approvalDraftFromDbSchema),
    added_user: masterStaffFromDbSchema,
});
export type ApprovalDraftAttachmentType = z.infer<typeof approvalDraftAttachmentFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalDraftAttachmentCreateSchema = approvalDraftAttachmentBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalDraftAttachmentCreateInput = z.infer<typeof approvalDraftAttachmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalDraftAttachmentUpdateSchema = approvalDraftAttachmentBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalDraftAttachmentUpdateInput = z.infer<typeof approvalDraftAttachmentUpdateSchema>;

export const approvalDraftAttachmentUpdatePayloadSchema = approvalDraftAttachmentUpdateSchema.omit({ id: true });
export type ApprovalDraftAttachmentUpdatePayload = z.infer<typeof approvalDraftAttachmentUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalDraftAttachmentUpsertSchema = z.union([
    approvalDraftAttachmentCreateSchema,
    approvalDraftAttachmentUpdateSchema,
]);
export type ApprovalDraftAttachmentUpsertInput = z.infer<typeof approvalDraftAttachmentUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalDraftAttachmentUpsertInput
): v is ApprovalDraftAttachmentUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
