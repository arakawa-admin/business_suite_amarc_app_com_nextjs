"use client";

import { useMemo } from "react";
import DialogForm from "@ui/dialogs/DialogForm";
import { PermitCommentForm } from "./PermitCommentForm";

export type CommentTargetType = "permit" | "reminder";
// export type CommentTypeCode = "memo" | "comment" | "reminder_response";
export type CommentSourceType = "detail" | "email_link" | "manual";

type CommentFormDialogProps = {
    open: boolean;
    onClose: () => void;

    targetType: CommentTargetType;
    targetId: string;

    // reminderId?: string | null;
    sourceType?: CommentSourceType;
    // defaultCommentTypeCode?: CommentTypeCode;

    title?: string;
    // subtitle?: string;
    formKey: number;
};

export function PermitCommentFormDialog({
    open,
    onClose,
    targetType,
    targetId,
    // reminderId = null,
    sourceType = "detail",
    // defaultCommentTypeCode = "memo",
    title,
    // subitle,
    formKey,
}: CommentFormDialogProps) {
    const resolvedTitle = useMemo(() => {
        if (title) return title;
        return "コメント";
        // return targetType === "reminder" ? "対応記録" : "コメント";
    }, [title
        // , targetType
    ]);

    // const resolvedSubtitle = useMemo(() => {
    //     if (subtitle) return subtitle;
    //     if (targetType === "reminder") {
    //         return "通知に対する対応内容やメモを登録できます。";
    //     }
    //     return "コメント・メモ・対応記録を登録できます。";
    // }, [subtitle, targetType]);

    return (
        <DialogForm
            isOpen={open}
            onClose={() => onClose()}
            title={resolvedTitle}
            // subtitle={resolvedSubtitle}
            modeLabel="登録"
            color="primary"
            confirmBeforeClose={true}
            isDirty={false}
            maxWidth="md"
        >
            <PermitCommentForm
                key={formKey}
                targetType={targetType}
                targetId={targetId}
                // reminderId={reminderId}
                sourceType={sourceType}
                // defaultCommentTypeCode={defaultCommentTypeCode}
                onSuccess={() => onClose()}
            />
        </DialogForm>
    );
}
