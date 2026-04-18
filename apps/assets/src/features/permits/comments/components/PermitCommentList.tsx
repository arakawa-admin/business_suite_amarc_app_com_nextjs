"use client";
import { Box, Stack, Typography } from "@mui/material";
import { type CommentListItem } from "@/features/permits/comments/repositories/commentRepository";
import { PermitCommentDeleteButton } from "./PermitCommentDeleteButton";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function PermitCommentList({
    permitId,
    comments,
}: {
    permitId: string;
    comments: CommentListItem[];
}) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                コメント履歴
            </Typography>

            {/* {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    コメントはまだありません。
                </Typography>
            ) : ( */}
                <Stack spacing={0.5}>
                    {comments.map((comment) => (
                        <Box key={comment.id} sx={{ px: 2, py: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                            <Stack spacing={1} direction={"row"} alignItems={"center"}>
                                <Typography variant="body1">{comment.body}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {comment.created_by_name ?? "不明"} / {format(comment.created_at, "yyyy-MM-dd HH:mm:ss", { locale: ja })}
                                </Typography>
                                <PermitCommentDeleteButton comment={comment} permitId={permitId} />
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            {/* )} */}
        </Stack>
    );
}
