"use server";

import { revalidatePath } from "next/cache";
import { createCommentSchema } from "@/features/permits/comments/schemas/commentSchema";
import { createCommentWithAudit } from "@/features/permits/comments/services/commentService";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

export type CreatePermitCommentActionState = {
    ok: boolean;
    error?: string;
    message?: string;
    redirectTo?: string;
};

export async function createPermitCommentAction(
    _prevState: CreatePermitCommentActionState,
    formData: FormData,
): Promise<CreatePermitCommentActionState> {
    const currentStaffId = await findCurrentStaffIdOrThrow();

    const parsed = createCommentSchema.safeParse({
        targetType: "permit",
        targetId: formData.get("targetId"),
        // commentTypeCode: formData.get("commentTypeCode"),
        body: formData.get("body"),
        sourceType: formData.get("sourceType") || "detail",
        // reminderId: formData.get("reminderId") || null,
    });

    if (!parsed.success) {
        return {
            ok: false,
            error:
                parsed.error.issues[0]?.message ??
                "入力内容を確認してください。",
        };
    }

    try {
        await createCommentWithAudit({
            ...parsed.data,
            currentStaffId: currentStaffId,
        });

        revalidatePath(`/permits/${parsed.data.targetId}`);
        return {
            ok: true,
            message: "コメントを登録しました。",
            redirectTo: `/permits/${parsed.data.targetId}#comments`,
        };
    } catch (error) {
        return {
            ok: false,
            error:
                error instanceof Error
                    ? error.message
                    : "コメント登録に失敗しました。",
        };
    }
}
