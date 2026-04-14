"use client";

import { ApprovalActionType } from "@/schemas/approval/approvalActionSchema";

import { DeleteConfirmDialog } from "@/components/common/dialogs/DeleteConfirmDialog";

import { deleteApprovalAction } from "@/lib/actions/approval/approvalAction";

// 1) 決裁コメント削除
export function ApprovalActionDeleteDialog({
    approvalActionItem,
    open,
    onClose,
}: {
    approvalActionItem: ApprovalActionType;
    open: boolean;
    onClose: () => void;
}) {
    const isOrder = approvalActionItem.order_id!==null;
    const isViewer = approvalActionItem.reviewer_id!==null;
    const type = isOrder ? "決裁" : isViewer ? "回議" : "";
    return (
        <DeleteConfirmDialog
            open={open}
            onClose={onClose}
            title={`${type}コメント (${approvalActionItem.comment}) を削除しますか?`}
            successMessage="コメントを削除しました"
            errorMessage="コメントの削除に失敗しました"
            doDelete={() => deleteApprovalAction(approvalActionItem.id)}
        />
    );
}
