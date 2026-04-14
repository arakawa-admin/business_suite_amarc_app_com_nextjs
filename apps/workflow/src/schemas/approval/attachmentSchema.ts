import { z } from "zod";
import { masterStaffFromDbSchema } from "../common/masterStaffSchema";

/* =========================
 * 共通ベース
 * ========================= */
export const attachmentBase = z.object({
    sha256: z.string(),
    bucket: z.string(),
    storage_key: z.string(),
    filename: z.string(),
    content_type: z.string(),
    byte_size: z.number(),

    thumbnail_key: z.string().optional(),
    thumbnail_type: z.string().optional(),
    thumbnail_size: z.number().optional(),

    uploaded_by:  z.string().min(1, "作成者IDは必須です"),
    uploaded_at: z.date(),
});

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const attachmentFromDbSchema = z.object({
    id: z.uuid(),
    ...attachmentBase.shape,
    uploader: masterStaffFromDbSchema,
});
export type AttachmentType = z.infer<typeof attachmentFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const attachmentCreateSchema = attachmentBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),

    label: z.string().optional(),
});
export type AttachmentCreateInput = z.infer<typeof attachmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const attachmentUpdateSchema = attachmentBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type AttachmentUpdateInput = z.infer<typeof attachmentUpdateSchema>;

export const attachmentUpdatePayloadSchema = attachmentUpdateSchema.omit({id: true});
export type AttachmentUpdatePayload = z.infer<typeof attachmentUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const attachmentUpsertSchema = z.union([
    attachmentCreateSchema,
    attachmentUpdateSchema,
]);
export type AttachmentUpsertInput = z.infer<typeof attachmentUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: AttachmentUpsertInput
): v is AttachmentUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
