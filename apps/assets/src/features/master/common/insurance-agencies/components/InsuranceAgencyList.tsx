"use client";
import { useRouter } from "next/navigation";

import { Box } from "@mui/material";
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from "@mui/x-data-grid";
import { jaJP } from '@mui/x-data-grid/locales';

import { resolveMasterValidityStatus } from "@/features/master/shared/helpers/masterValidity";
import { MasterValidityChip } from "@/features/master/shared/components/MasterValidityChip";
import type { InsuranceAgency } from "../types/insuranceAgencyTypes";

type Props = {
    rows: InsuranceAgency[];
    detailBasePath: string;
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("ja-JP");
}

export function InsuranceAgencyList({ rows, detailBasePath }: Props) {
    const router = useRouter();
    const columns: GridColDef<InsuranceAgency>[] = [
        {
            field: "insuranceCategoryName",
            headerName: "保険カテゴリ",
            minWidth: 160,
            flex: 1,
            sortable: true,
        },
        {
            field: "insuranceCompanyName",
            headerName: "保険会社名",
            minWidth: 160,
            flex: 1,
            sortable: true,
        },
        {
            field: "agencyName",
            headerName: "代理店名",
            minWidth: 200,
            flex: 1.2,
            sortable: true,
        },
        {
            field: "status",
            headerName: "状態",
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<InsuranceAgency>) => {
                const status = resolveMasterValidityStatus(params.row);
                return <MasterValidityChip status={status} />;
            },
        },
        {
            field: "validAt",
            headerName: "有効開始",
            minWidth: 180,
            flex: 1,
            sortable: true,
            valueFormatter: (value) => formatDateTime(value as string | null),
        },
        {
            field: "invalidAt",
            headerName: "有効終了",
            minWidth: 180,
            flex: 1,
            sortable: true,
            valueFormatter: (value) => formatDateTime(value as string | null),
        },
        {
            field: "updatedAt",
            headerName: "更新日時",
            minWidth: 180,
            flex: 1,
            sortable: true,
            valueFormatter: (value) => formatDateTime(value as string | null),
        },
    ];

    return (
        <Box sx={{ width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                getRowId={(row) => row.id}
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
                        sortModel: [
                            { field: "sortOrder", sort: "asc" },
                        ],
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
                    router.push(`${detailBasePath}/${params.row.id}`)
                }}
                sx={{
                    "& .MuiDataGrid-row": {
                        cursor: "pointer",
                        "&:hover": { color: "primary.main" }
                    },
                    "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                    },
                }}
            />
        </Box>
    );
}
