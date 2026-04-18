"use server";

import { revalidatePath } from "next/cache";
import { deleteCommentWithAudit } from "@/features/permits/comments/services/commentService";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

export type DeletePermitCommentActionState = {
    ok: boolean;
    error?: string;
    message?: string;
};

export async function deletePermitCommentAction(params: {
    commentId: string;
    permitId: string;
}): Promise<DeletePermitCommentActionState> {
    const currentStaffId = await findCurrentStaffIdOrThrow();

    const commentId = params.commentId;
    const permitId = params.permitId;
    if (!commentId) {
        return { ok: false, error: "commentId が不正です。" };
    }
    if (!permitId) {
        return { ok: false, error: "permitId が不正です。" };
    }

    try {
        await deleteCommentWithAudit({
            commentId,
            currentStaffId
        });

        revalidatePath(`/permits/${permitId}`);
        return {
            ok: true,
            message: "コメントを削除しました。",
        };
    } catch (error) {
        return {
            ok: false,
            error:
                error instanceof Error
                    ? error.message
                    : "コメント削除に失敗しました。",
        };
    }
}
