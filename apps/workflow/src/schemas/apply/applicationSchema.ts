import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { masterDepartmentFromDbSchema } from "@/schemas/common/masterDepartmentSchema";
import { masterStatusFromDbSchema } from "@/schemas/apply/masterStatusSchema";
import { masterStaffOptionFromDbSchema } from "@/schemas/apply/masterStaffOptionSchema";
import { applyFormFromDbSchema } from "@/schemas/apply/applyFormSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";
import { approvalOrderFromDbSchema } from "@/schemas/apply/approvalOrderSchema";

/* =========================
 * 共通ベース
 * ========================= */
const applicationBaseFields = ({
    apply_form_id: z.uuid("申請書は必須です"),
    department_id: z.uuid("部門は必須です"),
    author_id: z.uuid("投稿者は必須です"),
    status_id: z.string().min(1, "ステータスは必須です"),
    current_revision_id: z.uuid("現バージョンは必須です"),
    completed_at: z.date().nullable(),
})


/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const applicationFromDbSchema = z.object({
    id: z.uuid(),
    ...applicationBaseFields,
    department: masterDepartmentFromDbSchema,
    apply_form: applyFormFromDbSchema,
    author: z.object({
        staff: masterStaffFromDbSchema,
        options: masterStaffOptionFromDbSchema.optional(),
    }),
    application_revisions: z.array(applicationRevisionFromDbSchema),
    status: masterStatusFromDbSchema,
    // current_revision: applicationRevisionFromDbSchema,
    created_at: z.date(),
    updated_at: z.date(),
});
export type ApplicationType = z.infer<typeof applicationFromDbSchema>;

export const applicationWithRevisionsSchema = z.object({
    ...applicationFromDbSchema.shape,
    application_revisions: z.array(
        z.object({
            ...applicationRevisionFromDbSchema.shape,
            payload: z.json(),
        })
    ),
    approval_orders: z.array(approvalOrderFromDbSchema),
});
export type ApplicationWithRevisionsType = z.infer<typeof applicationWithRevisionsSchema>;


/* =========================
 * POST（新規登録）用
 * ========================= */
export const applicationCreateSchema = z
    .object({
        ...applicationBaseFields,
        id: z.never().optional(), // create は id を受け付けない
    });
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const applicationUpdateSchema = z
    .object({
        ...applicationBaseFields,
    })
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;

export const applicationUpdatePayloadSchema = z
    .object({
        ...applicationBaseFields,
        // schema: jsonStringSchema,
    })
    .partial();
export type ApplicationUpdatePayload = z.infer<typeof applicationUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const applicationUpsertSchema = z.union([
    applicationCreateSchema,
    applicationUpdateSchema,
]);
export type ApplicationUpsertInput = z.infer<typeof applicationUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApplicationUpsertInput
): v is ApplicationUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
