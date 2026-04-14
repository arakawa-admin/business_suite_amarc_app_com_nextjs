import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
// import { approvalFromDbSchema } from "@/schemas/approval/approvalSchema";
import { approvalRevisionAttachmentBase } from "@/schemas/approval/approvalRevisionAttachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
export const approvalRevisionBase = z.object({
    approval_id: z.uuid("稟議IDは必須です"),
    round: z.number(),
    budget: z.number(),
    details: z.string().min(1, "本文は必須です"),
    depreciation_period_months: z.number(),
    depreciation_amount: z.number(),
    start_date: z.date(),
    end_date: z.date(),
    billing_date: z.date().nullable().optional(),
    payment_date: z.date().nullable().optional(),
    snapshot_at: z.date(),
    snapshot_by: z.uuid("確定ユーザIDは必須です"),

    // attachments: z.array(approvalRevisionAttachmentBase).optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalRevisionFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalRevisionBase.shape,
    // approval: z.lazy(() => approvalFromDbSchema),
    snapshot_user: masterStaffFromDbSchema,

    attachments: z.array(approvalRevisionAttachmentBase).optional(),
});
export type ApprovalRevisionType = z.infer<typeof approvalRevisionFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalRevisionCreateSchema = approvalRevisionBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalRevisionCreateInput = z.infer<typeof approvalRevisionCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalRevisionUpdateSchema = approvalRevisionBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalRevisionUpdateInput = z.infer<typeof approvalRevisionUpdateSchema>;

export const approvalRevisionUpdatePayloadSchema = approvalRevisionUpdateSchema.omit({ id: true });
export type ApprovalRevisionUpdatePayload = z.infer<typeof approvalRevisionUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalRevisionUpsertSchema = z.union([
    approvalRevisionCreateSchema,
    approvalRevisionUpdateSchema,
]);
export type ApprovalRevisionUpsertInput = z.infer<typeof approvalRevisionUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalRevisionUpsertInput
): v is ApprovalRevisionUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
