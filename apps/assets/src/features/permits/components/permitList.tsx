"use client";
import { useRouter } from "next/navigation";

import Link from "next/link";
import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { jaJP } from '@mui/x-data-grid/locales';

import { PermitListFilter } from "./permitListFilter";

import type { PermitListRow } from "../types/permitTypes";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";
import { PermitCsvExportButton } from "@/features/permits/components/PermitCsvExportButton";
import AddIcon from '@mui/icons-material/Add';

type CategoryOption = {
    id: string;
    name: string;
};
type Props = {
    rows: PermitListRow[];
    categoryOptions: CategoryOption[];
};

function renderStatusChip(
    statusCode: PermitListRow["calculated_status_code"],
    statusName: PermitListRow["calculated_status_name"],
) {
    switch (statusCode) {
        case "expired":
            return <Chip label={statusName} color="error" size="small" />;
        case "alert_due":
            return <Chip label={statusName} color="warning" size="small" />;
        case "active":
            return <Chip label={statusName} color="success" size="small" />;
        case "unknown":
        default:
            return <Chip label={statusName} variant="outlined" size="small" />;
    }
}

const TITLE = "許認可一覧"

export function PermitList({ rows, categoryOptions }: Props) {
    const router = useRouter();

    const columns: GridColDef<PermitListRow>[] = [
        {
            field: "category_name",
            headerName: "分類",
            flex: 0.9,
            minWidth: 140,
            valueGetter: (_value, row) => row.category_sort_order ?? "—",
            renderCell: (params) => params.row.category_name
        },
        {
            field: "subject_name",
            headerName: "対象",
            flex: 1.4,
            minWidth: 220,
            renderCell: ({ row }) => (
                <Link
                    href={`/permits/${row.id}`}
                    style={{
                        color: "inherit",
                        textDecoration: "none",
                    }}
                >
                    {row.subject_name}
                </Link>
            ),
        },
        {
            field: "business_name",
            headerName: "業",
            flex: 1.2,
            minWidth: 180,
            valueGetter: (_value, row) => row.business_name ?? "—",
        },
        {
            field: "permit_number",
            headerName: "許可番号",
            flex: 1,
            minWidth: 160,
            valueGetter: (_value, row) => row.permit_number ?? "—",
        },
        {
            field: "issued_on",
            headerName: "許可日 / 発行日",
            flex: 0.9,
            minWidth: 140,
            valueGetter: (_value, row) => row.issued_on ?? "—",
        },
        {
            field: "expiry_on",
            headerName: "有効期限",
            flex: 0.9,
            minWidth: 140,
            valueGetter: (_value, row) => row.expiry_on ?? "—",
        },

        {
            field: "required_interval_label",
            headerName: "更新頻度",
            flex: 0.9,
            minWidth: 140,
            valueGetter: (_value, row) => row.required_interval_label ?? "—",
        },
        {
            field: "calculated_status_name",
            headerName: "状態",
            flex: 0.8,
            minWidth: 120,
            // sortable: false,
            // valueGetter: (_value, row) => row.calculated_status_code,
            renderCell: ({ row }) =>
                renderStatusChip(row.calculated_status_code, row.calculated_status_name),
        },
        // {
        //     field: "updated_at",
        //     headerName: "更新日時",
        //     flex: 1,
        //     minWidth: 180,
        //     valueFormatter: (v) => v && format(new Date(v as string), "yyyy-MM-dd", { locale: ja })
        // },
        // {
        //     field: "actions",
        //     headerName: "操作",
        //     minWidth: 180,
        //     sortable: false,
        //     filterable: false,
        //     renderCell: ({ row }) => (
        //         <Stack direction="row" spacing={1}>
        //             <Button
        //                 component={Link}
        //                 href={`/permits/${row.id}`}
        //                 size="small"
        //                 variant="outlined"
        //             >
        //                 詳細
        //             </Button>
        //             <Button
        //                 component={Link}
        //                 href={`/permits/${row.id}/edit`}
        //                 size="small"
        //                 variant="contained"
        //             >
        //                 編集
        //             </Button>
        //         </Stack>
        //     ),
        // },
    ];

    return (
        <Stack spacing={2}>
            <AssetsBreadcrumbs
                items={[
                    { title: "許認可一覧" },
                ]}
                />
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
                >
                <Box sx={{ flex: "1 1 auto" }}>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 'bold', px: 1 }}
                        >
                        {TITLE}
                    </Typography>
                </Box>

                <Button
                    component={Link}
                    href="/permits/new"
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    新規登録
                </Button>
                <PermitCsvExportButton />
            </Stack>

            <PermitListFilter
                categoryOptions={categoryOptions}
            />

            <Paper
                // variant="outlined"
                sx={{ p: 2, borderRadius: 4}}
                elevation={4}
                >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 20, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 20,
                                page: 0,
                            },
                        },
                        sorting: {
                            sortModel: [{ field: "updated_at", sort: "desc" }],
                        },
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
                        router.push(`/permits/${params.row.id}`)
                    }}
                    sx={{
                        "& .MuiDataGrid-row": {
                            cursor: "pointer",
                            "&:hover": { color: "primary.main" }
                        },
                    }}
                />
            </Paper>
        </Stack>
    );
}
