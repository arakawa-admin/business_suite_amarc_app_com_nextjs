import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { approvalFromDbSchema } from "@/schemas/approval/approvalSchema";
import { masterStatusFromDbSchema } from "@/schemas/approval/masterStatusSchema";

import { approvalActionFromDbSchema } from "@/schemas/approval/approvalActionSchema";

/* =========================
 * 共通ベース
 * ========================= */
const approvalOrderBase = z.object({
    approval_id: z.uuid("稟議IDは必須です"),
    approver_user_id: z.uuid("承認者は必須です"),
    sequence: z.number("承認順序は必須です"),
    status_id: z.uuid("ステータスは必須です"),
    remarks: z.string().nullable().optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const approvalOrderFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalOrderBase.shape,
    approval: z.lazy(() => approvalFromDbSchema),
    approver_user: masterStaffFromDbSchema,
    status: masterStatusFromDbSchema,
    created_at: z.date(),
    updated_at: z.date(),

    actions: z.array(z.lazy(() => approvalActionFromDbSchema)).default([]),
});
export type ApprovalOrderType = z.infer<typeof approvalOrderFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalOrderCreateSchema = approvalOrderBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalOrderCreateInput = z.infer<typeof approvalOrderCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalOrderUpdateSchema = approvalOrderBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalOrderUpdateInput = z.infer<typeof approvalOrderUpdateSchema>;

export const approvalOrderUpdatePayloadSchema = approvalOrderUpdateSchema.omit({ id: true });
export type ApprovalOrderUpdatePayload = z.infer<typeof approvalOrderUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalOrderUpsertSchema = z.union([
    approvalOrderCreateSchema,
    approvalOrderUpdateSchema,
]);
export type ApprovalOrderUpsertInput = z.infer<typeof approvalOrderUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalOrderUpsertInput
): v is ApprovalOrderUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
