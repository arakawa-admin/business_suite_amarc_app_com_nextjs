"use client";
import { useState } from "react";
import { Box, Chip, Typography, Stack, Tooltip, IconButton } from "@mui/material";
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from "@mui/x-data-grid";
import type { AuditLogListItem } from "../types/auditLogTypes";
import { AuditLogMetadataDialog } from "./AuditLogMetadataDialog";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

function renderActionChip(actionName: string) {
    switch (actionName) {
        case "登録":
            return <Chip size="small" label={actionName} color="primary" />;
        case "更新":
            return <Chip size="small" label={actionName} color="warning" />;
        case "削除":
            return <Chip size="small" label={actionName} color="error" />;
        case "完了":
            return <Chip size="small" label={actionName} color="success" />;
        default:
            return <Chip size="small" label={actionName} />;
    }
}

function summarizeMetadata(metadata: Record<string, unknown> | null): string {
    if (!metadata) return "";

    if (
        "changed_fields" in metadata &&
        Array.isArray(metadata.changed_fields)
    ) {
        const fields = metadata.changed_fields
            .map((field) => String(field))
            .join(", ");
        return fields ? `変更項目: ${fields}` : "";
    }

    if (
        "deleted" in metadata &&
        metadata.deleted &&
        typeof metadata.deleted === "object" &&
        "body" in metadata.deleted
    ) {
        const body = String(
            (metadata.deleted as Record<string, unknown>).body ?? "",
        );
        return body.length > 40 ? `${body.slice(0, 40)}...` : body;
    }

    if (
        "created" in metadata &&
        metadata.created &&
        typeof metadata.created === "object"
    ) {
        const created = metadata.created as Record<string, unknown>;

        if ("subject_name" in created) {
            return `作成: ${String(created.subject_name ?? "")}`;
        }

        if ("body" in created) {
            const body = String(created.body ?? "");
            return body.length > 40 ? `${body.slice(0, 40)}...` : body;
        }
    }

    try {
        const text = JSON.stringify(metadata);
        return text.length > 60 ? `${text.slice(0, 60)}...` : text;
    } catch {
        return "";
    }
}

export function AuditLogDataGrid({
    rows,
}: {
    rows: AuditLogListItem[];
}) {
    const [selectedMetadata, setSelectedMetadata] = useState<Record<string, unknown> | null>(null);
    const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);

    const handleOpenMetadata = (metadata: Record<string, unknown> | null) => {
        setSelectedMetadata(metadata);
        setMetadataDialogOpen(true);
    };

    const handleCloseMetadata = () => {
        setMetadataDialogOpen(false);
        setSelectedMetadata(null);
    };

    const columns: GridColDef<AuditLogListItem>[] = [
        {
            field: "created_at",
            headerName: "日時",
            minWidth: 160,
            flex: 0.9,
            valueFormatter: (_value, row) => formatDateTime(row.created_at),
        },
        {
            field: "created_by_name",
            headerName: "実行者",
            minWidth: 120,
            flex: 0.7,
            valueGetter: (_value, row) => row.created_by_name ?? "不明",
        },
        {
            field: "entity_type",
            headerName: "対象種別",
            minWidth: 120,
            flex: 0.6,
        },
        {
            field: "action_name",
            headerName: "操作",
            minWidth: 120,
            flex: 0.6,
            renderCell: (params: GridRenderCellParams<AuditLogListItem, string>) =>
                renderActionChip(params.value ?? ""),
            sortable: false,
            filterable: false,
        },
        {
            field: "summary",
            headerName: "要約",
            minWidth: 220,
            flex: 1.2,
            valueGetter: (_value, row) => row.summary ?? "",
        },
        {
            field: "metadata",
            headerName: "補助情報",
            minWidth: 280,
            flex: 1.6,
            sortable: false,
            filterable: false,
                renderCell: (params: GridRenderCellParams<AuditLogListItem, unknown>) => {
                    const metadata = params.row.metadata;
                    const summary = summarizeMetadata(metadata);

                    return (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ width: "100%", minWidth: 0 }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    flex: 1,
                                }}
                                title={summary}
                            >
                                {summary}
                            </Typography>

                            <Tooltip title="詳細を表示">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenMetadata(metadata)}
                                        disabled={!metadata}
                                    >
                                        <InfoOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    );
                },
        },
    ];

    return (
        <>
        <Box sx={{ width: "100%" }}>
            <DataGrid
                autoHeight
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                pageSizeOptions={[20, 50, 100]}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 20,
                            page: 0,
                        },
                    },
                }}
                sx={{
                    bgcolor: "background.paper",
                    "& .MuiDataGrid-cell": {
                        alignItems: "center",
                    },
                }}
            />
        </Box>
        <AuditLogMetadataDialog
            open={metadataDialogOpen}
            onClose={handleCloseMetadata}
            metadata={selectedMetadata}
        />
        </>
    );
}
