import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { applicationFromDbSchema } from "@/schemas/apply/applicationSchema";

// import { applicationActionFromDbSchema } from "@/schemas/apply/applicationActionSchema";

/* =========================
 * 共通ベース
 * ========================= */
const approvalViewerBase = z.object({
    application_id: z.uuid("申請IDは必須です"),
    viewer_user_id: z.uuid("閲覧者は必須です"),
    is_commented: z.boolean(),
    remarks: z.string().nullable().optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalViewerFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalViewerBase.shape,
    application: z.lazy(() => applicationFromDbSchema),
    viewer_user: masterStaffFromDbSchema,
    created_at: z.date(),
    updated_at: z.date(),

    // actions: z.array(z.lazy(() => applicationActionFromDbSchema)).default([]),
});
export type ApprovalViewerType = z.infer<typeof approvalViewerFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalViewerCreateSchema = approvalViewerBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalViewerCreateInput = z.infer<typeof approvalViewerCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalViewerUpdateSchema = approvalViewerBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalViewerUpdateInput = z.infer<typeof approvalViewerUpdateSchema>;

export const approvalViewerUpdatePayloadSchema = approvalViewerUpdateSchema.omit({ id: true });
export type ApprovalViewerUpdatePayload = z.infer<typeof approvalViewerUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalViewerUpsertSchema = z.union([
    approvalViewerCreateSchema,
    approvalViewerUpdateSchema,
]);
export type ApprovalViewerUpsertInput = z.infer<typeof approvalViewerUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalViewerUpsertInput
): v is ApprovalViewerUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
