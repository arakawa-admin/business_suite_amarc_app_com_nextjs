"use client";

// TODO RHFに直す

import { useActionState, useEffect, useRef } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    createCommentAction,
    type CreateCommentActionState,
} from "@/app/(protected)/comments/actions";

export type CommentTargetType = "permit" | "reminder";
// export type CommentTypeCode = "memo" | "comment" | "reminder_response";
export type CommentSourceType = "detail" | "email_link" | "manual";

type CommentFormProps = {
    targetType: CommentTargetType;
    targetId: string;
    // reminderId?: string | null;
    sourceType?: CommentSourceType;
    // defaultCommentTypeCode?: CommentTypeCode;
    onSuccess?: () => void;
};

const initialState: CreateCommentActionState = {
    ok: false,
};

export function PermitCommentForm({
    targetType,
    targetId,
    // reminderId = null,
    sourceType = "detail",
    // defaultCommentTypeCode = "memo",
    onSuccess,
}: CommentFormProps) {
    const router = useRouter();
    const [state, formAction, pending] = useActionState(
        createCommentAction,
        initialState,
    );

    const handledSuccessRef = useRef(false);
    const handledErrorRef = useRef<string | null>(null);

    useEffect(() => {
        if (state.error && handledErrorRef.current !== state.error) {
            handledErrorRef.current = state.error;
            toast.error(state.error);
        }
    }, [state.error]);

    useEffect(() => {
        if (state.ok && !handledSuccessRef.current) {
            handledSuccessRef.current = true;
            toast.success(state.message ?? "登録しました。");
            onSuccess?.();
            router.refresh();
        }
    }, [state.ok, state.message, onSuccess, router]);

    return (
        <Box component="form" action={formAction} sx={{ px: 3, py: 1 }}>
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <input type="hidden" name="sourceType" value={sourceType} />
            {/* <input type="hidden" name="reminderId" value={reminderId ?? ""} /> */}

            <Stack spacing={1}>
                {/* <TextField
                    select
                    name="commentTypeCode"
                    label="種別"
                    defaultValue={defaultCommentTypeCode}
                    fullWidth
                >
                    <MenuItem value="memo">メモ</MenuItem>
                    <MenuItem value="comment">コメント</MenuItem>
                    <MenuItem value="reminder_response">通知対応記録</MenuItem>
                </TextField> */}

                <TextField
                    name="body"
                    label="本文"
                    multiline
                    minRows={2}
                    fullWidth
                    required
                />

                <Box
                    sx={{
                        display: "flex",
                        // justifyContent: "flex-end",
                    }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={pending}
                        sx={{
                            fontWeight: "bold",
                        }}>
                        登録
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
