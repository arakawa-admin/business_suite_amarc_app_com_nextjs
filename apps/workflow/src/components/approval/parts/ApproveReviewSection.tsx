"use client";

import {
    Box,
    Typography,
    Paper,
    Chip,
    Toolbar,
    Stack,
} from "@mui/material";

import { format } from "date-fns";
import { ja } from "date-fns/locale";

import ApprovalReviewerForm from "@/components/approval/forms/ApprovalReviewerForm";
import { ApprovalActionForReviewDeleteButton } from "@/components/approval/buttons/ApprovalActionDeleteButton";
import { ApprovalWithRelationsType } from "@/schemas/approval/approvalSchema";

export default function ApproveReviewSection({
    approval,
}: {
    approval: ApprovalWithRelationsType
}) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", m: 1 }}>
                回議者
            </Typography>
            <Paper
                variant="outlined"
                sx={{ p: 2 }}
                >
                <Stack spacing={2}>
                    {approval.approval_reviewers && approval.approval_reviewers.map((r, i) => (
                        <Paper key={i}>
                            <Toolbar
                                variant="dense"
                                sx={{
                                    backgroundColor: `info.main`,
                                    color: "info.contrastText",
                                    fontWeight: "bold",
                                    fontSize: "0.8em",
                                    borderRadius: `4px 4px 0 0`,
                                    minHeight: "32px!important",
                                }}
                                >
                                { r.reviewer_user.name }
                            </Toolbar>
                            { r.actions.length == 0 &&
                                <Typography variant="subtitle2" sx={{ color: "text.secondary", m: 0.5, p: 1 }}>
                                    投稿はありません
                                </Typography>
                            }
                            { r.actions.length > 0 &&
                                <Stack key={i} spacing={1} sx={{ p: 1 }}>
                                    {r.actions.map((action, i) => (
                                        <Stack key={i} direction={"row"} spacing={1} alignItems={"center"}>
                                            <Chip label={action.action} size="small" sx={{ mr: 1 }} />
                                            <Typography
                                                component={'span'}
                                                variant="body2"
                                                sx={{ color: "text.secondary", mb: 0.5 }}
                                                >{ action.comment }</Typography>
                                            <Chip label={`${format(action.action_at, "yyyy/MM/dd HH:mm", { locale: ja })} に投稿`} size="small" sx={{ ml: 1 }} />
                                            <ApprovalActionForReviewDeleteButton
                                                approvalActionItem={action}
                                                />
                                        </Stack>
                                        ))
                                    }
                                </Stack>
                            }
                            {/* 投稿権限 + 順番が回ってきたときだけ */}
                            <ApprovalReviewerForm
                                approvalReviewerItem={r}
                                />
                        </Paper>
                    ))}
                </Stack>
            </Paper>
        </Box>
    )
}
