"use client";

import {
    Box,
    Typography,
    Paper,
    Chip,
    Stack,
    Toolbar
} from "@mui/material";

import { format } from "date-fns";
import { ja } from "date-fns/locale";

import ApprovalOrderForm from "@/components/approval/forms/ApprovalOrderForm";
import ApproveReturnSection from "@/components/approval/parts/ApproveReturnSection";

import { ApprovalActionForOrderDeleteButton } from "@/components/approval/buttons/ApprovalActionDeleteButton";
import { ApprovalWithRelationsType } from "@/schemas/approval/approvalSchema";
import { AttachmentType } from "@/schemas/approval/attachmentSchema";

import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import UploadedFileList from "@ui/form/file/UploadedFileList";
import { ApprovalActionType } from "@/schemas/approval/approvalActionSchema";

export default function ApproveOrderSection({
    approval,
}: {
    approval: ApprovalWithRelationsType
}) {
    // コンポーネントの return より前で定義

    const attachments = (action: ApprovalActionType) => {
        if (action == null) { return [] }
        const attachments = action.attachments?.map((x) => x.attachment).filter((x): x is AttachmentType => x != null);
        if(!attachments) return []
        return attachments?.length === 0 ? [] : attachments;
    }

    return (
        <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", m: 1 }}>
                決裁者
            </Typography>
            <Paper
                variant="outlined"
                sx={{ p: 2 }}
                >
                <Stack spacing={2}>
                    {approval.approval_orders && approval.approval_orders.sort((a, b) => a.sequence - b.sequence).map((o, i) => (
                        <Paper
                            key={i}
                            elevation={8}
                            >
                            <Toolbar
                                variant="dense"
                                sx={{
                                    backgroundColor: ["waiting", "cancelled"].includes(o.status.code) ? "grey.300": o.status.color=="default" ? "grey.500": `${o.status.color}.main`,
                                    color: ["waiting", "cancelled"].includes(o.status.code) ? "grey.700": "success.contrastText",
                                    fontWeight: "bold",
                                    borderRadius: `4px 4px 0 0`,
                                }}
                                >
                                <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                    <Chip component={'span'} label={o.sequence} size="small" sx={{ mr: 1, bgcolor: "white" }} />
                                    <div>{ o.status.name }</div>
                                    <div>{ o.approver_user.name }</div>
                                </Stack>
                            </Toolbar>

                            { o.actions.length > 0 &&
                                <Stack spacing={1} sx={{ p: 2 }}>
                                    {o.actions.sort((a, b) => a.action_at > b.action_at ? 1 : -1).map((action, i) => (
                                        <Stack
                                            key={i}
                                            spacing={1}
                                            >
                                            <Stack
                                                direction={"row"}
                                                spacing={1}
                                                alignItems={"center"}
                                                sx={{ pl: action.action==="resubmit" ? 2 : 0 }}>
                                                {action.action==="resubmit" && <SubdirectoryArrowRightIcon sx={{ fontSize: "12px" }} />}
                                                <Chip
                                                    label={
                                                        action.action==="approve" ? "承認" :
                                                        action.action==="reject" ? "否認" :
                                                        action.action==="return" ? "差戻し" :
                                                        action.action==="resubmit" ? "差戻し返答" :
                                                        "待機中"
                                                    }
                                                    size="small"
                                                    sx={{
                                                        mr: 1,
                                                        color: action.action==="resubmit" ? "text.secondary"
                                                            : action.action==="approve" ? "success.main"
                                                            : action.action==="reject" ? "error.main"
                                                            : action.action==="return" ? "warning.main" : "text.secondary"
                                                    }}
                                                    />
                                                <Typography
                                                    component={'span'}
                                                    variant="body2"
                                                    >
                                                    { action.comment }
                                                </Typography>
                                                <Typography component={'span'} variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                                                    {action.actor_user.name} が {format(action.action_at, "yyyy/MM/dd HH:mm", { locale: ja })} に投稿
                                                </Typography>
                                                <ApprovalActionForOrderDeleteButton
                                                    approvalActionItem={action}
                                                    approvalOrderItem={o}
                                                    />
                                            </Stack>

                                            {action.attachments && action.attachments.length > 0 && (
                                                <UploadedFileList
                                                    attachments={attachments(action)}
                                                    fetchUrl={"/api/approval/attachments/signed-urls"}
                                                    onRemove={() => {}}
                                                    />
                                            )}
                                        </Stack>
                                        ))
                                    }
                                </Stack>
                            }
                            <Stack spacing={1}>
                                {/* 投稿権限 + 順番が回ってきたときだけ */}
                                <ApprovalOrderForm approvalOrder={o} />

                                {/* 差し戻し中だけ */}
                                <ApproveReturnSection approval={approval} approvalOrder={o} />
                            </Stack>

                        </Paper>
                    ))}
                </Stack>
            </Paper>
        </Box>
    )
}
