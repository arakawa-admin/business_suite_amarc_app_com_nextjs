import { z } from "zod";

// import { masterStaffFromDbSchema } from "@/schemas/common/masterStaffSchema";
import { masterEmployTypeFromDbSchema } from "@/schemas/apply/masterEmployTypeSchema";

/* =========================
 * 共通ベース
 * ========================= */
const masterStaffOptionBase = z.object({
    staff_id: z.uuid("スタッフは必須です"),
    birthday: z.date({ error: "日付を入力して下さい" }),
    employ_type_id: z.uuid("雇用形態は必須です"),
    employ_start: z.date({ error: "入社日を入力して下さい" }),
    employ_deadline: z.date({ error: "雇用満了日を入力して下さい" }),
    next_notification: z.date({ error: "次回通知日を入力して下さい" }).optional(),
})

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const masterStaffOptionFromDbSchema = z.object({
    id: z.uuid(),
    ...masterStaffOptionBase.shape,
    // staff: z.lazy(() => masterStaffFromDbSchema), // 循環参照になるため遅延評価
    employ_type: masterEmployTypeFromDbSchema,
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterStaffOptionType = z.infer<typeof masterStaffOptionFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterStaffOptionCreateSchema = masterStaffOptionBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
});
export type MasterStaffOptionCreateInput = z.infer<typeof masterStaffOptionCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterStaffOptionUpdateSchema = masterStaffOptionBase
    .partial()
    .extend({
        id: z.uuid(),
    });
export type MasterStaffOptionUpdateInput = z.infer<typeof masterStaffOptionUpdateSchema>;

export const masterStaffOptionUpdatePayloadSchema = masterStaffOptionUpdateSchema.omit({ id: true });
export type MasterStaffOptionUpdatePayload = z.infer<typeof masterStaffOptionUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterStaffOptionUpsertSchema = z.union([
    masterStaffOptionCreateSchema,
    masterStaffOptionUpdateSchema,
]);
export type MasterStaffOptionUpsertInput = z.infer<typeof masterStaffOptionUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterStaffOptionUpsertInput
): v is MasterStaffOptionUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
