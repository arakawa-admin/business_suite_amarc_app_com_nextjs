import { z } from "zod";
import { masterStaffFromDbSchema } from "../common/masterStaffSchema";
import { approvalWithRevisionCreateSchema } from "@/schemas/approval/approvalSchema";
import { approvalDraftAttachmentBase } from "@/schemas/approval/approvalDraftAttachmentSchema";

// 下書きpayload = create schema から post_files を除外
export const approvalDraftPayloadSchema = approvalWithRevisionCreateSchema.omit({ post_files: true });

/* =========================
 * 共通ベース
 * ========================= */
const approvalDraftBase = z.object({
    owner_user_id: z.string().min(1, "投稿者IDは必須です"),
    payload: approvalDraftPayloadSchema,

    version: z.number().int('整数で入力してください').min(1, '1以上で入力してください'),

    post_files: z.array(z.object({
        file: z.instanceof(File),
        thumbnail: z.instanceof(File),
        name: z.string(),
        type: z.enum(["pdf", "image"]),
    }))
    .optional(),
});

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalDraftFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalDraftBase.shape,
    owner_user: masterStaffFromDbSchema,

    created_at: z.date(),
    updated_at: z.date(),

    draft_attachments: z.array(approvalDraftAttachmentBase).optional(),
});
export type ApprovalDraftType = z.infer<typeof approvalDraftFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalDraftCreateSchema = approvalDraftBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalDraftCreateInput = z.infer<typeof approvalDraftCreateSchema>;


/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalDraftUpdateSchema = approvalDraftBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalDraftUpdateInput = z.infer<typeof approvalDraftUpdateSchema>;

export const approvalDraftUpdatePayloadSchema = approvalDraftUpdateSchema.omit({ id: true });
export type ApprovalDraftUpdatePayload = z.infer<typeof approvalDraftUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalDraftUpsertSchema = z.union([
    approvalDraftCreateSchema,
    approvalDraftUpdateSchema,
]);
export type ApprovalDraftUpsertInput = z.infer<typeof approvalDraftUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalDraftUpsertInput
): v is ApprovalDraftUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
