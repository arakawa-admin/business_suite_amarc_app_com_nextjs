"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { DeleteActionButton } from "@/components/common/buttons/DeleteActionButton";
import { ApprovalActionType } from "@/schemas/approval/approvalActionSchema";
import { ApprovalOrderType } from "@/schemas/approval/approvalOrderSchema";

import {
    ApprovalActionDeleteDialog,
} from "@/components/approval/dialogs/ApprovalDeleteDialogs";

// 1) 決裁コメント削除
export function ApprovalActionForOrderDeleteButton({
    approvalActionItem,
    approvalOrderItem,
    disabled = false,
}: {
    approvalActionItem: ApprovalActionType;
    approvalOrderItem: ApprovalOrderType;
    disabled?: boolean;
}) {
    const { user, profile } = useAuth();

    const can = useMemo(() => {
        if (approvalOrderItem.status.code !== "pending") return false; // 決裁中以外は削除不可
        if (user?.is_admin) return true;
        return approvalActionItem.actor_user_id === profile?.id;
    }, [user, profile, approvalActionItem, approvalOrderItem]);

    return (
        <DeleteActionButton
            can={can}
            disabled={disabled}
            renderDialog={({ open, onClose }) => (
                <ApprovalActionDeleteDialog
                    approvalActionItem={approvalActionItem}
                    open={open}
                    onClose={onClose}
                    />
            )}
        />
    );
}


// 2) 回議コメント削除
export function ApprovalActionForReviewDeleteButton({
    approvalActionItem,
    disabled = false,
}: {
    approvalActionItem: ApprovalActionType;
    disabled?: boolean;
}) {
    const { user, profile } = useAuth();

    const can = useMemo(() => {
        if (user?.is_admin) return true;
        return approvalActionItem.actor_user_id === profile?.id;
    }, [user, profile, approvalActionItem]);

    return (
        <DeleteActionButton
            can={can}
            disabled={disabled}
            renderDialog={({ open, onClose }) => (
                <ApprovalActionDeleteDialog
                    approvalActionItem={approvalActionItem}
                    open={open}
                    onClose={onClose}
                    />
            )}
        />
    );
}
