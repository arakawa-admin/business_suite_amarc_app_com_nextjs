import { insertComment, findCommentById, deleteCommentById } from "../repositories/commentRepository";
import type { CreateCommentInput } from "../schemas/commentSchema";
import { logCreateAudit, logDeleteAudit } from "@/features/audit/services/auditLogService";

type CreateCommentWithAuditParams = CreateCommentInput & {
    currentStaffId: string;
};

export async function createCommentWithAudit(
    params: CreateCommentWithAuditParams,
) {
    const comment = await insertComment({
        targetType: params.targetType,
        targetId: params.targetId,
        body: params.body,
        sourceType: params.sourceType ?? null,
        currentStaffId: params.currentStaffId,
    });

    await logCreateAudit({
        entityType: "comment",
        entityId: comment.id,
        summary: "コメントを登録",
        currentStaffId: params.currentStaffId,
    });

    return comment;
}

export async function deleteCommentWithAudit(params: {
    commentId: string;
    currentStaffId: string;
}) {
    const comment = await findCommentById(params.commentId);

    if (!comment) {
        throw new Error("削除対象のコメントが見つかりません。");
    }
    await deleteCommentById(params.commentId);

    await logDeleteAudit({
        entityType: "comment",
        entityId: comment.id,
        summary: "コメントを削除",
        currentStaffId: params.currentStaffId,
    });

    await logDeleteAudit({
        entityType: "comment",
        entityId: params.commentId,
        summary: "コメントを削除",
        metadata: {
            ...comment,
        },
        currentStaffId: params.currentStaffId,
    });

    return comment;
}
