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
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';

import useSWR from 'swr'

import { getMasterStaffOptions } from '@/lib/actions/apply/masterStaffOption';
import { MasterStaffOptionType } from '@/schemas/apply/masterStaffOptionSchema';

import DialogMasterForm from '@/components/common/dialogs/DialogMasterForm';
import Form from './Form';


import HomeIcon from '@mui/icons-material/Home';
import { toast } from "react-toastify";
import { FetchResult } from "@/types/fetch-result";

export default function ClientPageMasterStaffOption({
    initial,
}: {
    initial: MasterStaffOptionType[]
}) {
    const TITLE = "スタッフオプションマスタ"

    const router = useRouter();

    const {
        data: result,
        mutate,
    } = useSWR<FetchResult<MasterStaffOptionType[]>>(
        'apply/master-staff-options',
        getMasterStaffOptions,
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
            field: 'staff',
            headerName: 'スタッフ',
            flex: 1,
            valueGetter: (params: {id: string}) => { return params.id; },
            renderCell: (params) => {
                return (
                    `${params.row.staff.name} (${params.row.staff.kana})`
                )
            }
        },
        {
            field: 'employ_type',
            headerName: '雇用形態',
            flex: 1,
            valueGetter: (params: {id: string}) => { return params.id; },
            renderCell: (params) => {
                return (
                    params.row.employ_type?.name
                )
            }
        },
        {
            field: 'birthday',
            headerName: '誕生日',
            minWidth: 120,
            renderCell: (params) => {
                return (
                    format(params.row.birthday, "yyyy-MM-dd", { locale: ja })
                )
            }
        },
        {
            field: 'employ_term',
            headerName: '雇用期間',
            flex: 1,
            valueGetter: (params, row) => { return row.employ_start; },
            renderCell: (params) => {
                return (
                    format(params.row.employ_start, "yyyy-MM-dd", { locale: ja })
                    + " ~ " +
                    format(params.row.employ_deadline, "yyyy-MM-dd", { locale: ja })

                )
            }
        },
        {
            field: 'next_notification',
            headerName: '次回通知日',
            minWidth: 120,
            renderCell: (params) => {
                return (
                    params.row.next_notification && format(params.row.next_notification, "yyyy-MM-dd", { locale: ja })
                )
            }
        },
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
                </ButtonGroup>
                </>
            )
        },
    ];

    // 新規作成 or 編集
    const [createOpen, setCreateOpen] = useState(false);
    const [isCreate, setIsCreate] = useState(true);
    const [editItem, setEditItem] = useState({} as MasterStaffOptionType);
    const handleCreate = () => {
        setCreateOpen(true);
        setIsCreate(true);
    }
    const handleEdit = (editItem: MasterStaffOptionType) => {
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
        setEditItem({} as MasterStaffOptionType);
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
                            columnVisibilityModel={{
                                id: false,
                            }}
                            pagination
                            initialState={{
                                sorting: { sortModel: [{ field: 'kana', sort: 'asc' }] },
                            }}
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
        </Box>
    );
}
