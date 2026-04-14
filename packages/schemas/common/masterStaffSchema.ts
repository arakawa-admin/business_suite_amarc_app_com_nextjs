import { z } from "zod";
import { isBefore, startOfDay, endOfDay } from "date-fns";

import { masterLoginUserFromDbSchema } from "./masterLoginUserSchema";
import { staffDepartmentWithDepartmentFromDbSchema } from "./staffDepartmentSchema";

/* =========================
 * 共通ベース
 * ========================= */
const masterStaffObject = z.object({
    login_user_id: z.uuid(),
    name: z.string().min(1, "スタッフ名は必須です"),
    kana: z.string().min(1, "カナは必須です"),
    remarks: z.string().nullable().optional(),
    valid_at: z.date({ error: "日付を入力して下さい" }).optional(),
    invalid_at: z.date({ error: "日付を入力して下さい" }).optional(),
})
const masterStaffBase = masterStaffObject.superRefine((val, ctx) => {
    const { valid_at, invalid_at } = val;
    if (valid_at && invalid_at) {
        // 同日OKにする場合は startOfDay / endOfDay で丸めて比較
        const start = startOfDay(valid_at);
        const end   = endOfDay(invalid_at);
        if (isBefore(end, start)) {
            ctx.addIssue({
                code: "custom",
                message: "終了日は開始日以降にしてください",
                path: ["invalid_at"], // エラー表示を invalid_at に付ける
            });
        }
    }
});

/* =========================
 * fetch(GET) 用（DBからの完全形）
 * ========================= */
export const masterStaffFromDbSchema = z.object({
    id: z.uuid(),
    ...masterStaffBase.shape,
    login_user: z.lazy(() => masterLoginUserFromDbSchema).nullable().optional(),
    memberships: z.array(z.lazy(() => staffDepartmentWithDepartmentFromDbSchema)).default([]),
    created_at: z.date(),
    updated_at: z.date(),
});
export type MasterStaffType = z.infer<typeof masterStaffFromDbSchema>;

/* =========================
 * POST（新規登録）用
 * ========================= */
export const masterStaffCreateSchema = masterStaffBase.safeExtend({
    // create は id を受け付けない（来たら弾く）
    id: z.never().optional(),
    department_ids: z.array(z.string()).default([]).optional(),
});
export type MasterStaffCreateInput = z.infer<typeof masterStaffCreateSchema>;
// 所属部門追加版
// export const masterStaffWithDepartmentCreateSchema = masterStaffCreateSchema.safeExtend({
//     department_ids: z.array(z.string()).default([]).optional(),
// });
// export type MasterStaffWithDepartmentCreateInput = z.infer<typeof masterStaffWithDepartmentCreateSchema>;

/* =========================
 * PUT（更新）用
 * - 部分更新にしたい場合は .partial() を適用し、id は必須
 * - 全項目必須更新にしたいなら .partial() を外す
 * ========================= */
export const masterStaffUpdateSchema = masterStaffObject
    .partial()
    .extend({
        id: z.uuid(),
        department_ids: z.array(z.string()).default([]).optional(),
    });
export type MasterStaffUpdateInput = z.infer<typeof masterStaffUpdateSchema>;

export const masterStaffUpdatePayloadSchema = masterStaffUpdateSchema.omit({ id: true });
export type MasterStaffUpdatePayload = z.infer<typeof masterStaffUpdatePayloadSchema>;

/* =========================
 * 共通（create/update 両対応）: Union
 * - RHF の resolver を1本化したいときに便利
 * ========================= */
export const masterStaffUpsertSchema = z.union([
    masterStaffCreateSchema,
    masterStaffUpdateSchema,
]);
export type MasterStaffUpsertInput = z.infer<typeof masterStaffUpsertSchema>;

/* =========================
 * Type Guard（分岐用）
 * ========================= */
export function isUpdateInput(
    v: MasterStaffUpsertInput
): v is MasterStaffUpdateInput {
    // id があれば更新とみなす
    return typeof (v)?.id === "string";
}
