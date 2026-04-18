"use client";

import { useMemo, useState, useTransition } from "react";
import { IconButton, Tooltip, Zoom } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import DialogConfirm from "@ui/dialogs/DialogConfirm";
import { deletePermitCommentAction } from "@/app/(protected)/permits/[id]/comments/actions";
import { useAuth } from "@contexts/AuthContext";
import { type CommentListItem } from "@/features/permits/comments/repositories/commentRepository";

export function PermitCommentDeleteButton({
    comment,
    permitId,
}: {
    comment: CommentListItem;
    permitId: string;
}) {
    const { profile } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    const can = useMemo(() => comment.created_by === profile?.id, [comment, profile]);
    if (!can) return null;

    const handleDelete = () => {
        setOpen(false);

        startTransition(async () => {
            const result = await deletePermitCommentAction({
                commentId: comment.id,
                permitId,
            });

            if (!result.ok) {
                toast.error(result.error ?? "コメント削除に失敗しました。");
                return;
            }

            toast.success(result.message ?? "コメントを削除しました。");
            router.refresh();
        });
    };

    return (
        <>
            <Tooltip
                title="削除"
                arrow
                placement="top"
                slots={{ transition: Zoom }}
                slotProps={{
                    tooltip: {
                        sx: {
                            fontWeight: "700",
                            bgcolor: "error.main",
                            "& .MuiTooltip-arrow": { color: "error.main" },
                        },
                    },
                }}
            >
                <IconButton onClick={() => setOpen(true)} disabled={pending}>
                    <DeleteIcon sx={{ fontSize: "0.8em" }} color="error" />
                </IconButton>
            </Tooltip>

            <DialogConfirm
                isOpen={open}
                onDone={handleDelete}
                onCancel={() => setOpen(false)}
                title="コメントの削除"
                color="error"
                text="コメントを削除します。よろしいですか？"
                okText="削除"
            />
        </>
    );
}
