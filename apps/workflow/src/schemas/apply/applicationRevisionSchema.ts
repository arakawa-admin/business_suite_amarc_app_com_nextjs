import { z } from "zod";

import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { applicationRevisionAttachmentBase } from "@/schemas/apply/applicationRevisionAttachmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
const applicationRevisionBaseFields = ({
    application_id: z.uuid("申請は必須です"),
    revision_no: z.number("バージョンは必須です"),
    payload : z.json(),
    submitted_at: z.date(),
})


/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const applicationRevisionFromDbSchema = z.object({
    id: z.uuid(),
    ...applicationRevisionBaseFields,
    // application: z.lazy(() => applicationFromDbSchema),
    creater: masterStaffFromDbSchema,
    created_at: z.date(),

    attachments: z.array(applicationRevisionAttachmentBase).optional(),
});

export type ApplicationRevisionType = z.infer<typeof applicationRevisionFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const applicationRevisionCreateSchema = z
    .object({
        ...applicationRevisionBaseFields,
        id: z.never().optional(), // create は id を受け付けない
    });
export type ApplicationRevisionCreateInput = z.infer<typeof applicationRevisionCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const applicationRevisionUpdateSchema = z
    .object({
        ...applicationRevisionBaseFields,
    })
    .partial()
    .extend({
        id: z.uuid(),
    });
export type ApplicationRevisionUpdateInput = z.infer<typeof applicationRevisionUpdateSchema>;

export const applicationRevisionUpdatePayloadSchema = z
    .object({
        ...applicationRevisionBaseFields,
        // schema: jsonStringSchema,
    })
    .partial();
export type ApplicationRevisionUpdatePayload = z.infer<typeof applicationRevisionUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const applicationRevisionUpsertSchema = z.union([
    applicationRevisionCreateSchema,
    applicationRevisionUpdateSchema,
]);
export type ApplicationRevisionUpsertInput = z.infer<typeof applicationRevisionUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: ApplicationRevisionUpsertInput
): v is ApplicationRevisionUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
