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

import { getMasterLoginUsers, enableMasterLoginUser, disableMasterLoginUser } from '@/lib/actions/common/masterLoginUser';
import { MasterLoginUserType } from '@/schemas/common/masterLoginUserSchema';

import DialogConfirm from '@/components/common/dialogs/DialogConfirm';
import DialogMasterForm from '@/components/common/dialogs/DialogMasterForm';
import FormMasterUser from './Form';

import HomeIcon from '@mui/icons-material/Home';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { toast } from "react-toastify";

import { FetchResult } from "@/types/fetch-result";

export default function ClientPageMasterUser({
    initial,
}: {
    initial: MasterLoginUserType[]
}) {
    const TITLE = "ログインユーザマスタ"

    const router = useRouter();

    const {
        data: result,
        mutate,
    } = useSWR<FetchResult<MasterLoginUserType[]>>(
        'api/master-login-users',
        getMasterLoginUsers,
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
    const rows = result?.ok ? result.data : [];

    const columns:GridColDef[] = [
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: '名前', flex: 1 },
        {
            field: 'email',
            headerName: 'メールアドレス',
            flex: 1,
        },
        {
            field: 'is_admin',
            headerName: '管理者',
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                params.value && <TaskAltIcon color="warning" />
            )
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
    const [editItem, setEditItem] = useState({} as MasterLoginUserType);
    const handleCreate = () => {
        setCreateOpen(true);
        setIsCreate(true);
    }
    const handleEdit = (editItem: MasterLoginUserType) => {
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
        setEditItem({} as MasterLoginUserType);
    }

    // 無効化
    const [deleteItem, setDeleteItem] = useState({} as MasterLoginUserType);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const handleDelete = (staff: MasterLoginUserType) => {
        setDeleteItem(staff);
        setConfirmDeleteOpen(true);
    }
    const doDelete = async () => {
        try{
            if(!deleteItem.id) return
            await disableMasterLoginUser(deleteItem.id);
            mutate();
            toast.success("無効にしました");
        } finally {
            cancelDelete();
        }
    }
    const cancelDelete = () => {
        setDeleteItem({} as MasterLoginUserType);
        setConfirmDeleteOpen(false);
    }

    // 有効化
    const [restoreItem, setRestoreItem] = useState({} as MasterLoginUserType);
    const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
    const handleRestore = (staff: MasterLoginUserType) => {
        setRestoreItem(staff);
        setConfirmRestoreOpen(true);
    }
    const doRestore = async () => {
        try{
            if(!restoreItem.id) return
            await enableMasterLoginUser(restoreItem.id);
            mutate();
            toast.success("有効にしました");
        } finally {
            cancelRestore();
        }
    }
    const cancelRestore = () => {
        setRestoreItem({} as MasterLoginUserType);
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
                <FormMasterUser
                    editValues={editItem}
                    onSubmitted={() => handleCreated()}
                    onClose={() => cancelCreate()}
                    />
            </DialogMasterForm>

            <DialogConfirm
                isOpen={confirmDeleteOpen}
                onCancel={cancelDelete}
                onDone={doDelete}
                title="ログインユーザ無効化"
                text="ログインユーザを無効にしていいですか"
                color = "error"
                okText="無効にする"
                />

            <DialogConfirm
                isOpen={confirmRestoreOpen}
                onCancel={cancelRestore}
                onDone={doRestore}
                title="ログインユーザ有効化"
                text="ログインユーザを有効にしていいですか"
                color = "success"
                okText="有効にする"
                />
        </Box>
    );
}
