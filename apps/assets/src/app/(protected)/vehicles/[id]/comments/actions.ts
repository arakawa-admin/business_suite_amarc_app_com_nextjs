"use server";

import { revalidatePath } from "next/cache";
import { deleteCommentWithAudit } from "@/features/vehicles/comments/services/commentService";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

export type DeleteVehicleCommentActionState = {
    ok: boolean;
    error?: string;
    message?: string;
};

export async function deleteVehicleCommentAction(params: {
    commentId: string;
    vehicleId: string;
}): Promise<DeleteVehicleCommentActionState> {
    const currentStaffId = await findCurrentStaffIdOrThrow();

    const commentId = params.commentId;
    const vehicleId = params.vehicleId;
    if (!commentId) {
        return { ok: false, error: "commentId が不正です。" };
    }
    if (!vehicleId) {
        return { ok: false, error: "vehicleId が不正です。" };
    }

    try {
        await deleteCommentWithAudit({
            commentId,
            currentStaffId
        });

        revalidatePath(`/vehicles/${vehicleId}`);
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
