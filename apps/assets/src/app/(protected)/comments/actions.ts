"use server";

import { revalidatePath } from "next/cache";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";
import { createCommentSchema } from "@/features/permits/comments/schemas/commentSchema";
import { createCommentWithAudit } from "@/features/permits/comments/services/commentService";

export type CreateCommentActionState = {
    ok: boolean;
    error?: string;
    message?: string;
};

export async function createCommentAction(
    _prevState: CreateCommentActionState,
    formData: FormData,
): Promise<CreateCommentActionState> {
    const currentStaffId = await findCurrentStaffIdOrThrow();

    const parsed = createCommentSchema.safeParse({
        targetType: formData.get("targetType"),
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
            currentStaffId,
        });

        // if (parsed.data.targetType === "permit") {
        //     revalidatePath(`/permits/${parsed.data.targetId}`);
        // }

        // if (parsed.data.targetType === "reminder" && parsed.data.reminderId) {
            revalidatePath(`/permits`);
            revalidatePath(`/permits/${parsed.data.targetId}`);
        // }

        return {
            ok: true,
            message: "コメントを登録しました。",
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
