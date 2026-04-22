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
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { VehicleListFilter } from "./vehicleListFilter";

import type { VehicleDetailItem } from "../types/vehicleTypes";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";
import { VehicleCsvExportButton } from "@/features/vehicles/components/vehicleCsvExportButton";
import AddIcon from '@mui/icons-material/Add';

type CategoryOption = {
    id: string;
    name: string;
};
type Props = {
    rows: VehicleDetailItem[];
    departmentOptions: CategoryOption[];
};

// TODO
// function renderStatusChip(
//     statusCode: VehicleDetailItem["calculated_status_code"],
//     statusName: VehicleDetailItem["calculated_status_name"],
// ) {
//     switch (statusCode) {
//         case "expired":
//             return <Chip label={statusName} color="error" size="small" />;
//         case "alert_due":
//             return <Chip label={statusName} color="warning" size="small" />;
//         case "active":
//             return <Chip label={statusName} color="success" size="small" />;
//         case "unknown":
//         default:
//             return <Chip label={statusName} variant="outlined" size="small" />;
//     }
// }

const TITLE = "車両一覧"

export function VehicleList({ rows, departmentOptions }: Props) {
    const router = useRouter();

    const columns: GridColDef<VehicleDetailItem>[] = [
        {
            field: "registrationNumber",
            headerName: "登録番号",
            flex: 1.5,
            minWidth: 140,
            valueGetter: (value) => value ?? "—",
        },
        {
            field: "departmentName",
            headerName: "使用部門",
            flex: 1.2,
            minWidth: 180,
            valueGetter: (value) => value ?? "—",
        },        {
            field: "manufacturerName",
            headerName: "メーカー名",
            flex: 1.4,
            minWidth: 220,
            valueGetter: (value) => value ?? "—",
        },
        {
            field: "vehicleName",
            headerName: "車名",
            flex: 1.4,
            minWidth: 220,
            valueGetter: (value) => value ?? "—",
        },
        {
            field: "typeName",
            headerName: "タイプ",
            flex: 1.4,
            minWidth: 220,
            valueGetter: (value) => value ?? "—",
        },
        {
            field: "inspectionExpiryOn",
            headerName: "車検期限",
            flex: 0.9,
            valueGetter: (value) => value ?? "—",
            renderCell: ({ row }) => {
                if(row.inspectionExpiryOn === null) { return "-" }
                return <Chip label={format(row.inspectionExpiryOn, "yyyy/MM", { locale: ja })} color="error" size="small" />
            }
        },
        {
            field: "inspectionAlertOn",
            headerName: "車検満了アラート",
            flex: 0.9,
            valueGetter: (value) => value ?? "—",
            renderCell: ({ row }) => <Chip label={row.inspectionAlertOn} color="warning" size="small" />,
        },
        // {
        //     field: "voluntaryInsuranceExpiryOn",
        //     headerName: "任意保険期限",
        //     flex: 0.9,
        //     minWidth: 140,
        //     valueGetter: (value) => value ?? "—",
        // },

        // TODO
        // {
        //     field: "calculated_status_name",
        //     headerName: "状態",
        //     flex: 0.8,
        //     minWidth: 120,
        //     renderCell: ({ row }) =>
        //         renderStatusChip(row.calculated_status_code, row.calculated_status_name),
        // },

        // TODO 更新ダイアログ作成　詳細ページからも呼ぶ
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            renderCell: () => (
                    <Button
                        // component={Link}
                        // href={`/vehicles/${row.id}/edit`}
                        size="small"
                        color="success"
                        variant="contained"
                    >
                        車検更新
                    </Button>
            ),
        },
    ];

    return (
        <Stack spacing={2}>
            <AssetsBreadcrumbs
                items={[
                    { title: "車両一覧" },
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
                    href="/vehicles/new"
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    新規登録
                </Button>
                <VehicleCsvExportButton />
            </Stack>

            <VehicleListFilter
                departmentOptions={departmentOptions}
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
                        router.push(`/vehicles/${params.row.id}`)
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
