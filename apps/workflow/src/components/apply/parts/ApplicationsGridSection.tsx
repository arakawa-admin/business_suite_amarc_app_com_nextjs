"use client";

import { useRouter } from "next/navigation";

import {
    Chip,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Breadcrumbs,
    Tooltip,
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { ApplicationWithRevisionsType } from "@/schemas/apply/applicationSchema";
import { ApprovalOrderType } from "@/schemas/approval/approvalOrderSchema";

export default function ApplicationsGridSection({
    applications,
    title,
    color="info"
}: {
    applications: ApplicationWithRevisionsType[]
    title: string
    color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
}) {
    const router = useRouter();

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID" },
        {
            field: "status",
            headerName: "ステータス",
            width: 120,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                return (
                    <Chip
                        label={params.row.status.name}
                        color={params.row.status.color}
                        size="small"
                        />
                )
            }
        },
        {
            field: "created_at",
            headerName: "申請日",
            width: 120,
            valueFormatter: (p) =>
                format(new Date(p as string), "yyyy-MM-dd", { locale: ja }),
        },
        {
            field: "author",
            headerName: "投稿者",
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                return (
                    <Box>
                        {params.row.author?.name}
                        {params.row.department?.name}
                    </Box>
                )
            },
        },
        {
            field: "approval_orders",
            headerName: "承認状況",
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                return (
                    <Box sx={{ py: 1 }}>
                        <Breadcrumbs
                            separator={<NavigateNextIcon fontSize="small" />}
                            aria-label="breadcrumb"
                            >
                            {params.row.approval_orders?.map((order: ApprovalOrderType) => (
                                <Tooltip
                                    key={order.id}
                                    title={order.status.name}
                                    arrow placement="top"
                                    slotProps={{
                                        tooltip: {
                                            sx: {
                                                fontWeight: "700",
                                                bgcolor: `${order.status.color}.main`,
                                                "& .MuiTooltip-arrow": { color: `${order.status.color}.main` },
                                            },
                                        },
                                    }}>
                                    <Chip
                                        label={order.approver_user.name}
                                        color={order.status.color}
                                        size="small"
                                        />
                                </Tooltip>
                            ))}
                        </Breadcrumbs>
                    </Box>
                )
            },
        },
    ];

    return (
        <Accordion
            defaultExpanded
            sx={{ width: "100%" }}
            >
            <AccordionSummary
                expandIcon={
                    <ArrowDropDownIcon
                        sx={{ color: `${color}.contrastText` }}
                    />}
                className={`bg-gradient-to-b from-${color}-dark via-${color}-main to-${color}-light`}
                sx={{
                    color: `${color}.contrastText`,
                    fontWeight: "bold",
                    minHeight: "48px!important",
                    fontSize: "0.9em",
                }}
                >
                {title}
            </AccordionSummary>
            <AccordionDetails sx={{ border: "1px solid", borderColor: "divider" }}>
                <DataGrid
                    rows={applications}
                    columns={columns}
                    columnVisibilityModel={{
                        id: false,
                    }}
                    getRowId={(row) => row.id}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25, page: 0 } },
                        sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
                    }}
                    localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                    pagination
                    pageSizeOptions={[5, 10, 25, 50]}
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
                        router.push(`/apply/${params.row.apply_form.code}/${params.row.id}`)
                    }}
                    sx={{
                        "& .MuiDataGrid-row": {
                            cursor: "pointer",
                            "&:hover": { color: "primary.main" }
                        },
                    }}
                    />
            </AccordionDetails>
        </Accordion>

    )
}
