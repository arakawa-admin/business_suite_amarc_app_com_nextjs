"use client";
import { Box, Breadcrumbs, Chip, Container, Avatar, AvatarGroup, Stack, Alert, Tooltip } from "@mui/material";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';

import { useRouter } from "next/navigation";

import ApprovalBreadcrumbs from "@/components/approval/parts/ApprovalBreadcrumbs";

import CreateIcon from '@mui/icons-material/Create';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { ApprovalCreateButton } from "@/components/approval/buttons/ApprovalCreateButton";

import { ApprovalType } from "@/schemas/approval/approvalSchema";
import { ApprovalOrderType } from "@/schemas/approval/approvalOrderSchema";
import { ApprovalReviewerType } from "@/schemas/approval/approvalReviewerSchema";

const iconMap = {
    "pending": <CreateIcon sx={{ fontSize: "16px" }} />,
    "approved": <ThumbUpIcon sx={{ fontSize: "16px" }} />,
    "rejected": <ThumbDownIcon sx={{ fontSize: "16px" }} />,
    "return": <ReplyIcon sx={{ fontSize: "16px" }} />,
};

export default function AprovalListPage({
    approvals,
}: {
    approvals: ApprovalType[] | undefined
}) {
    const router = useRouter();


    const columns:GridColDef[] = [
        { field: 'id', headerName: 'ID' },
        {
            field: 'status',
            headerName: 'ステータス',
            minWidth: 100,
            valueGetter: (params: {id: string}) => { return params.id; },
            renderCell: (params) => {
                return (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Chip label={params.row.status.name} color={params.row.status.color} />
                    </Box>
                )
            }
        },
        {
            field: 'submitted_at',
            headerName: '起案日時',
            minWidth: 140,
            valueFormatter: (v) => format(new Date(v as string), "yyyy-MM-dd HH:mm", { locale: ja })
        },
        {
            field: 'department_name_snapshot',
            headerName: '起案部門',
            minWidth: 100,
            renderCell: (params) => { return params.row.department_name_snapshot },
            valueGetter: (_params, row) => { return row.department.id },
        },
        {
            field: 'author_name_snapshot',
            headerName: '起案者',
            minWidth: 100,
            renderCell: (params) => { return params.row.author_name_snapshot },
            valueGetter: (_params, row) => { return row.author.id },
        },
        {
            field: 'title',
            headerName: 'タイトル',
            flex: 2,
        },
        {
            field: 'step',
            headerName: '承認状況',
            flex: 3,
            renderCell: (params) => {
                return (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                        <Breadcrumbs separator=">">
                            { params.row.approval_orders.map((o: ApprovalOrderType) => {
                                return (
                                    <Tooltip key={o.id} title={o.status.name} arrow placement="top"
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    fontWeight: "700",
                                                    bgcolor: `${o.status.color}.main`,
                                                    "& .MuiTooltip-arrow": { color: `${o.status.color}.main` },
                                                },
                                            },
                                        }}>
                                        <Chip
                                            label={o.approver_user.name}
                                            color={o.status.color}
                                            icon={ iconMap[o.status.code as keyof typeof iconMap] || <AccountCircleIcon sx={{ fontSize: "16px" }} /> }
                                            />
                                    </Tooltip>
                                )
                            })}
                        </Breadcrumbs>
                    </Box>
                );
            },
        },
        {
            field: 'reviewers',
            headerName: '回議者',
            flex: 1,
            renderCell: (params) => {
                return (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                        <AvatarGroup max={4} spacing="small">
                            { params.row.approval_reviewers.map((r: ApprovalReviewerType) => {
                                return (
                                    <Tooltip key={r.id} title={r.reviewer_user.name} arrow placement="top">
                                        <Avatar alt={r.reviewer_user.name} />
                                    </Tooltip>
                                )
                            })}
                        </AvatarGroup>
                    </Box>
                );
            },
        },


    ];

    return (
        <Container
            sx={{ p: 3, mb: 6 }}
            maxWidth="xl"
            >
            <Stack direction={"row"} justifyContent={"space-between"} sx={{ m: 1 }}>
                <ApprovalBreadcrumbs
                    items={[ { title: "稟議書一覧" } ]}
                    />

                <ApprovalCreateButton color="primary" />
            </Stack>
            <DataGrid
                rows={approvals}
                columns={columns}
                localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                columnVisibilityModel={{
                    id: false,
                }}
                pagination
                initialState={{
                    sorting: { sortModel: [{ field: 'kana', sort: 'asc' }] },
                }}
                onRowClick={(params, event) => {
                    const target = event.target as HTMLElement;
                        if (
                            target.closest("button") ||
                            target.closest("a") ||
                            target.closest('[role="checkbox"]') ||
                            target.closest('[data-no-row-click="true"]')
                        ) {
                            return;
                        }
                    router.push(`/approval/${params.row.id}`)
                }}
                sx={{
                    "& .MuiDataGrid-row": {
                        cursor: "pointer",
                        "&:hover": { color: "primary.main" }
                    },
                }}
                />

            <Stack spacing={2}>
                <Alert severity="error" variant="filled">TODO 検索機能</Alert>
                <Alert severity="error" variant="filled">TODO 表示権限</Alert>
            </Stack>

        </Container>
    )
}

