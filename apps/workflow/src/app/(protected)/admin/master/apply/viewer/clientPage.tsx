"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";

import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Typography,
    Breadcrumbs,
    Link,
} from '@mui/material';

import { format, isAfter, isBefore } from "date-fns";
import { ja } from "date-fns/locale";

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';

import useSWR from 'swr'

import { getMasterFormViewers, enableMasterFormViewer, disableMasterFormViewer } from '@/lib/actions/apply/masterFormViewer';
import { MasterFormViewerType } from '@/schemas/apply/masterFormViewerSchema';

import DialogConfirm from '@/components/common/dialogs/DialogConfirm';
import DialogMasterForm from '@/components/common/dialogs/DialogMasterForm';
import Form from './Form';

import HomeIcon from '@mui/icons-material/Home';
import { toast } from "react-toastify";

import { FetchResult } from "@/types/fetch-result";

export default function ClientPageMasterFormViewer({
    initial,
}: {
    initial: MasterFormViewerType[]
}) {
    const TITLE = "閲覧者マスタ"

    const router = useRouter();

    const {
        data: result,
        mutate,
    } = useSWR<FetchResult<MasterFormViewerType[]>>(
        'apply/master-form-viewers',
        getMasterFormViewers,
        {
            fallbackData: { ok: true, data: initial ?? [] },
            refreshInterval: 0,
            revalidateOnFocus: false,
        }
    )
    // エラー時のtoast表示（1回だけ）
    const lastErrorRef = useRef<string | null>(null);
    useEffect(() => {
        if (result && !result.ok && result.error !== lastErrorRef.current) {
            lastErrorRef.current = result.error;
            toast.error(result.error);
        }
    }, [result]);
    // SWRのdataを直接使う
    const rows = result?.ok ? result.data : [];

    const columns:GridColDef[] = [
        { field: 'id', headerName: 'ID' },
        {
            field: 'apply_form',
            headerName: '申請書',
            flex: 1,
            renderCell: (params) => {
                return (
                    params.row.apply_form.name
                )
            }
        },
        {
            field: 'department',
            headerName: '部門',
            flex: 1,
            renderCell: (params) => {
                return (
                    params.row.department?.name
                )
            }
        },
        {
            field: 'viewer',
            headerName: '名前',
            flex: 1,
            renderCell: (params) => {
                return (
                    params.row.viewer_user?.name
                )
            }
        },
        {
            field: 'valid_at',
            headerName: '有効開始',
            flex: 1,
            valueFormatter: (v) => format(new Date(v as string), "yyyy-MM-dd HH:mm", { locale: ja })
        },
        {
            field: 'invalid_at',
            headerName: '有効終了',
            flex: 1,
            valueFormatter: (v) => format(new Date(v as string), "yyyy-MM-dd HH:mm", { locale: ja })
        },
        // { field: 'created_at', headerName: '作成日時', flex: 1 },
        // { field: 'updated_at', headerName: '更新日時', flex: 1 },
        {
            field: 'action',
            headerName: "",
            flex: 1,
            align: 'right',
            renderCell: (params) => (
                <>
                <ButtonGroup
                    variant="contained"
                    sx={{
                        '& .MuiButtonGroup-firstButton': {
                            borderColor: 'white',
                        }
                    }}>
                    <Button
                        color="warning"
                        size="small"
                        onClick={() => handleEdit(params.row)}
                        >
                        編集
                    </Button>
                    {isAfter(params.row.invalid_at, new Date()) && (
                        <Button
                            color="error"
                            size="small"
                            onClick={() => handleDelete(params.row)}
                            >
                            削除
                        </Button>
                    )}
                    {isBefore(params.row.invalid_at, new Date()) && (
                        <Button
                            color="success"
                            size="small"
                            onClick={() => handleRestore(params.row)}
                            >
                            復元
                        </Button>
                    )}
                </ButtonGroup>
                </>
            )
        },
    ];

    // 新規作成 or 編集
    const [createOpen, setCreateOpen] = useState(false);
    const [isCreate, setIsCreate] = useState(true);
    const [editItem, setEditItem] = useState({} as MasterFormViewerType);
    const handleCreate = () => {
        setCreateOpen(true);
        setIsCreate(true);
    }
    const handleEdit = (editItem: MasterFormViewerType) => {
        setEditItem(editItem);
        setCreateOpen(true);
        setIsCreate(false);
    }
    const handleCreated = () => {
        cancelCreate()
        mutate();
    }
    const cancelCreate = () => {
        setCreateOpen(false);
        setEditItem({} as MasterFormViewerType);
    }

    // 無効化
    const [deleteItem, setDeleteItem] = useState({} as MasterFormViewerType);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const handleDelete = (staff: MasterFormViewerType) => {
        setDeleteItem(staff);
        setConfirmDeleteOpen(true);
    }
    const doDelete = async () => {
        try{
            await disableMasterFormViewer(deleteItem.id);
            mutate();
            toast.success("無効にしました");
        } finally {
            cancelDelete();
        }
    }
    const cancelDelete = () => {
        setDeleteItem({} as MasterFormViewerType);
        setConfirmDeleteOpen(false);
    }

    // 有効化
    const [restoreItem, setRestoreItem] = useState({} as MasterFormViewerType);
    const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
    const handleRestore = (staff: MasterFormViewerType) => {
        setRestoreItem(staff);
        setConfirmRestoreOpen(true);
    }
    const doRestore = async () => {
        try{
            await enableMasterFormViewer(restoreItem.id);
            mutate();
            toast.success("有効にしました");
        } finally {
            cancelRestore();
        }
    }
    const cancelRestore = () => {
        setRestoreItem({} as MasterFormViewerType);
        setConfirmRestoreOpen(false);
    }

    return (
        <Box>
            <Container maxWidth="xl">
                <Box sx={{ py: 1 }} >
                    <Breadcrumbs>
                        <Link
                            underline="hover"
                            fontSize="small"
                            color="inherit"
                            onClick={() => router.push('/admin')}
                            >
                            <Button startIcon={<HomeIcon />}>
                                マスタTOP
                            </Button>
                        </Link>
                        <Typography
                            sx={{ color: 'text.inherit' }}
                            component={'span'}
                            fontSize="small"
                            >
                            {TITLE}
                        </Typography>
                    </Breadcrumbs>
                </Box>
                <Box sx={{ backgroundColor: 'white', p: 2 }}>
                    <Box
                        sx={{
                            pb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2,
                        }}
                        >
                        <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold' }}
                            >
                            {TITLE}
                        </Typography>
                        <Button
                            size="large"
                            className="my-1 font-bold"
                            variant="contained"
                            color="primary"
                            onClick={() => handleCreate()}
                            >
                            新規登録
                        </Button>
                    </Box>
                    <Box>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                            // disableColumnMenu={true}
                            columnVisibilityModel={{
                                id: false,
                            }}
                            pagination
                            getRowClassName={(params) => {
                                return (params.row.invalid_at && isBefore(params.row.invalid_at, new Date()))
                                    ? 'bg-gray-300'
                                    : '';
                            }}
                            initialState={{
                                sorting: { sortModel: [{ field: 'kana', sort: 'asc' }] },
                            }}

                            // initialState={{
                            //     pagination: {
                            //         paginationModel: {
                            //             pageSize: 50,  // デフォルトの表示件数
                            //             page: 0,      // 初期ページ
                            //         },
                            //     },
                            // }}
                            // pageSizeOptions={[10, 25, 50]}
                            // processRowUpdate={processRowUpdate}
                            // onCellKeyDown={handleCellKeyDown}
                            // editMode="row"
                            // apiRef={apiRef}
                            />
                    </Box>
                </Box>
            </Container>

            <DialogMasterForm
                isOpen={createOpen}
                title={TITLE}
                isCreate={isCreate}
                onClose={() => cancelCreate()}
                >
                <Form
                    masters={rows}
                    editValues={editItem}
                    onSubmitted={() => handleCreated()}
                    onClose={() => cancelCreate()}
                    />
            </DialogMasterForm>

            <DialogConfirm
                isOpen={confirmDeleteOpen}
                onCancel={cancelDelete}
                onDone={doDelete}
                title="回議者無効化"
                text="回議者を無効にしていいですか"
                color = "error"
                okText="無効にする"
                />

            <DialogConfirm
                isOpen={confirmRestoreOpen}
                onCancel={cancelRestore}
                onDone={doRestore}
                title="回議者有効化"
                text="回議者を有効にしていいですか"
                color = "success"
                okText="有効にする"
                />
        </Box>
    );
}
