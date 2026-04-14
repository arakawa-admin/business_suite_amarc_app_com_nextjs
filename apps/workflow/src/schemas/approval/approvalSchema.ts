import { z } from "zod";
import { masterStaffFromDbSchema } from "../common/masterStaffSchema";
import { masterDepartmentFromDbSchema } from "../common/masterDepartmentSchema";
import { masterStatusFromDbSchema } from "../approval/masterStatusSchema";

import { approvalRevisionBase, approvalRevisionFromDbSchema } from "../approval/approvalRevisionSchema";
import { approvalOrderFromDbSchema } from "../approval/approvalOrderSchema";
import { approvalReviewerFromDbSchema } from "../approval/approvalReviewerSchema";
// import { attachmentFromDbSchema } from "./attachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
const approvalBase = z.object({
    // serial_no: z.string().min(1, "稟議書No.は必須です").max(200, "200文字以内で入力してください"),
    title: z.string().min(1, "タイトルは必須です").max(200, "200文字以内で入力してください"),
    // status_id: z.string().min(1, "ステータスは必須です"),
    // round: z.number("数字を入力して下さい").int('整数で入力してください').min(0, '0以上で入力してください'),

    author_id: z.string().min(1, "投稿者IDは必須です"),
    author_name_snapshot: z.string().min(1, "投稿者名は必須です"),
    department_id: z.string().min(1, "部門IDは必須です"),
    department_name_snapshot: z.string().min(1, "部門名は必須です"),

    current_revision_id: z.string().optional(),

    // TODO
    // submitted_at
    // current_order_id
    // returned_order_id
    // is_disclosure
    // capital_plan_id

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
export const approvalFromDbSchema = z.object({
    id: z.uuid(),
    ...approvalBase.shape,
    author: masterStaffFromDbSchema,
    department: masterDepartmentFromDbSchema,
    status: masterStatusFromDbSchema,

    serial_no: z.string().min(1, "稟議No.は必須です"),
    submitted_at: z.date(),
    created_at: z.date(),
    updated_at: z.date(),
});
export type ApprovalType = z.infer<typeof approvalFromDbSchema>;

/* =========================
 * fetch(GET) 用（リレーション込み DBからの完全形）
 * ========================= */
export const approvalWithRelationsFromDbSchema = approvalFromDbSchema.safeExtend({
    approval_revisions: z.array(approvalRevisionFromDbSchema).nullish(),
    approval_orders: z.array(approvalOrderFromDbSchema).nullish(),
    approval_reviewers: z.array(approvalReviewerFromDbSchema).nullish(),
});
export type ApprovalWithRelationsType = z.infer<typeof approvalWithRelationsFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const approvalCreateSchema = approvalBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type ApprovalCreateInput = z.infer<typeof approvalCreateSchema>;
// relation revisions
export const approvalWithRevisionCreateSchema = approvalBase.safeExtend({
    ...approvalRevisionBase.shape,
    id: z.never().optional(),
    approval_id: z.never().optional(),
    round: z.never().optional(),
    snapshot_at: z.never().optional(),
    snapshot_by: z.never().optional(),
});
export type ApprovalCreateWithRevisionInput = z.infer<typeof approvalWithRevisionCreateSchema>;


/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const approvalUpdateSchema = approvalBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApprovalUpdateInput = z.infer<typeof approvalUpdateSchema>;

export const approvalWithRevisionUpdateSchema = approvalBase
    // .omit({ post_files: true })
    .partial()
    .extend({ id: z.uuid() })
    .safeExtend({
        ...approvalRevisionBase.shape,
        approval_id: z.never().optional(),
        round: z.never().optional(),
        snapshot_at: z.never().optional(),
        snapshot_by: z.never().optional(),
    })
export type ApprovalWithRevisionUpdateInput = z.infer<typeof approvalWithRevisionUpdateSchema>;


export const approvalUpdatePayloadSchema = approvalUpdateSchema.omit({ id: true });
export type ApprovalUpdatePayload = z.infer<typeof approvalUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const approvalUpsertSchema = z.union([
    approvalCreateSchema,
    approvalUpdateSchema,
]);
export type ApprovalUpsertInput = z.infer<typeof approvalUpsertSchema>;

export const approvalWithRevisionUpsertSchema = z.union([
    approvalWithRevisionCreateSchema,
    approvalWithRevisionUpdateSchema,
]);
// approvalWithRevisionCreateSchema;
export type ApprovalWithRevisionUpsertInput = z.infer<typeof approvalWithRevisionUpsertSchema>;


/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApprovalUpsertInput
): v is ApprovalUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
export function isUpdateWithRevisionInput(
    v: ApprovalWithRevisionUpsertInput
): v is ApprovalWithRevisionUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
