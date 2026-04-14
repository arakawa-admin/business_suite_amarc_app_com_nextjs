"use client";
import { useMemo } from "react";

import {
    Box,
    Typography,
    Paper,
    Stack,
    Alert,
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";

import { ApprovalOrderType } from "@/schemas/approval/approvalOrderSchema";
import { ApprovalWithRelationsType } from "@/schemas/approval/approvalSchema";

import { ApprovalReSubmitButton } from "@/components/approval/buttons/ApprovalCreateButton";
import ApprovalReturnForm from "@/components/approval/forms/ApprovalReturnForm";

export default function ApproveReturnSection({
    approval,
    approvalOrder,
}: {
    approval: ApprovalWithRelationsType
    approvalOrder: ApprovalOrderType
}) {
    const { user, profile } = useAuth();
    const can = useMemo(() => {
        if (!["return"].includes(approvalOrder.status.code)) return false; // 決裁中以外は削除不可
        if (user?.is_admin) return true;
        return approvalOrder.approval.author_id === profile?.id;
    }, [user, profile, approvalOrder]);
    if( !can ) return null;

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", mx: 1 }}>
                差し戻し
            </Typography>
            <Paper
                variant="outlined"
                sx={{ p: 2 }}
                >
                <Stack spacing={1}>
                    <Alert severity="warning">稟議書の改訂版を提出する場合は、先に提出してから、差し戻しに対するコメントを投稿して下さい。</Alert>
                    <ApprovalReSubmitButton
                        approvalItem={approval}
                        />

                    <ApprovalReturnForm
                        approval={approval}
                        approvalOrder={approvalOrder}
                        />
                </Stack>
            </Paper>
        </Box>
    )
}
