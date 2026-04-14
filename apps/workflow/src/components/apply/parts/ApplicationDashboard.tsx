"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import {
    Button,
    Paper,
    Stack,
    Box,
    Typography,
} from "@mui/material";

import SelectAnyDate from "@ui/form/SelectAnyDate";

import AddIcon from '@mui/icons-material/Add';

import { ApplicationWithRevisionsType } from "@/schemas/apply/applicationSchema";
import ApplyBreadcrumbs from "@/components/apply/parts/ApplyBreadcrumbs";

import ApplicationsGridSection from "@/components/apply/parts/ApplicationsGridSection";

export default function ApplicationDashboard({
    applications,
    applyName,
    applyType,
}: {
    applications: ApplicationWithRevisionsType[]
    applyName: string,
    applyType: string,
}) {
    const { profile } = useAuth();
    const router = useRouter();
    const params = useSearchParams();

    const [selectDate, setSelectDate] = useState(new Date());

    // ▼--- クエリから初期日付をセットする処理 ---▼
    useEffect(() => {
        const raw = params.get("date");
        if (!raw) return;

        let d: Date | null = null;

        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            // YYYY-MM-DD
            d = new Date(raw);
        } else if (/^\d{4}-\d{2}$/.test(raw)) {
            // YYYY-MM
            d = new Date(raw + "-01T00:00:00");
        } else if (/^\d{4}$/.test(raw)) {
            // YYYY
            d = new Date(raw + "-01-01T00:00:00");
        }
        if (d && !isNaN(d.getTime())) {
            setTimeout(() => setSelectDate(d), 0);
        }
    }, [params]);

    const onMonthChange = (d: Date) => {
        const query = new URLSearchParams(params);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        query.set("date", `${year}-${month}`);

        router.push(`?${query.toString()}`);
    };

    const myApplications = applications
                            .filter(a => a.author_id === profile?.id)
                            .filter(a => a.completed_at==null);

    const myApproveTurn = applications
                            .filter(a => a.approval_orders.some(o => o.approver_user_id === profile?.id))
                            .filter(a => a.approval_orders.find(o => ["pending", "return"].includes(o.status.code)))
                            .filter(a => a.completed_at==null);

    const completed = applications.filter(a => a.completed_at != null);

    return (
        <Box>
            <ApplyBreadcrumbs
                items={[ { title: applyName } ]}
                />
            <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>{applyName}</Typography>
                    <Stack direction="row" justifyContent="space-between">
                        <Button
                            href={`/apply/${applyType}/new`}
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{ fontWeight: "bold" }}
                            size="large"
                            >
                            新規作成
                        </Button>
                        <SelectAnyDate
                            mode="month"
                            value={selectDate}
                            minDate={new Date('2026-01-01')}
                            maxDate={new Date()}
                            onChange={(v) => v && onMonthChange(v)}
                            />
                    </Stack>

                    {/* ログインユーザが提出した申請書エリア */}
                    <ApplicationsGridSection
                        applications={myApplications}
                        title="あなたが申請中"
                        color="info"
                        />

                    {/* ログインユーザの未決済申請エリア */}
                    <ApplicationsGridSection
                        applications={myApproveTurn}
                        title="あなたの決裁待ち"
                        color="error"
                        />

                    {/* 承認後の残務処理エリア */}
                    {/* TODO 対象ユーザにだけ表示 */}
                    <ApplicationsGridSection
                        applications={[]}
                        title="承認後の残務処理"
                        color="warning"
                        />

                    {/* 決裁済みエリア */}
                    <ApplicationsGridSection
                        applications={completed}
                        title="決裁済み"
                        color="success"
                        />
                </Stack>
            </Paper>
        </Box>
    );
}
