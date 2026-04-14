import { z } from "zod";

import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";
import { attachmentFromDbSchema } from "@/schemas/apply/attachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
export const applicationRevisionAttachmentBase = z.object({
    application_revision_id: z.uuid("申請書版IDは必須です"),
    attachment_id: z.uuid("ファイルIDは必須です"),
    label: z.string().nullable().optional(),
    sort_order: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),

    created_at: z.date(),

    attachment: attachmentFromDbSchema.optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const applicationRevisionAttachmentFromDbSchema = z.object({
    id: z.uuid(),
    ...applicationRevisionAttachmentBase.shape,
    applicationRevision: z.lazy(() => applicationRevisionFromDbSchema),
});
export type ApplicationRevisionAttachmentType = z.infer<typeof applicationRevisionAttachmentFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const applicationRevisionAttachmentCreateSchema = applicationRevisionAttachmentBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApplicationRevisionAttachmentCreateInput = z.infer<typeof applicationRevisionAttachmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const applicationRevisionAttachmentUpdateSchema = applicationRevisionAttachmentBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApplicationRevisionAttachmentUpdateInput = z.infer<typeof applicationRevisionAttachmentUpdateSchema>;

export const applicationRevisionAttachmentUpdatePayloadSchema = applicationRevisionAttachmentUpdateSchema.omit({ id: true });
export type ApplicationRevisionAttachmentUpdatePayload = z.infer<typeof applicationRevisionAttachmentUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const applicationRevisionAttachmentUpsertSchema = z.union([
    applicationRevisionAttachmentCreateSchema,
    applicationRevisionAttachmentUpdateSchema,
]);
export type ApplicationRevisionAttachmentUpsertInput = z.infer<typeof applicationRevisionAttachmentUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApplicationRevisionAttachmentUpsertInput
): v is ApplicationRevisionAttachmentUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
