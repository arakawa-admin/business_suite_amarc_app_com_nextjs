"use client";

import Link from "next/link";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import type {
    PermitDetailRow,
    PermitReminderViewRow,
} from "../types/permitTypes";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";
import { PermitDeleteConfirmDialog } from "./permitDeleteConfirmDialog";
import { PermitHardDeleteButton } from "./permitHardDeleteButton";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
    permit: PermitDetailRow;
    reminders: PermitReminderViewRow[];
    showHardDeleteButton?: boolean;
};

function RowItem({
    label,
    value,
}: {
    label: string;
    value: string | boolean | null | undefined;
}) {
    let displayValue: string;

    if (typeof value === "boolean") {
        displayValue = value ? "はい" : "いいえ";
    } else {
        displayValue = value && String(value).length > 0 ? String(value) : "—";
    }

    return (
        <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {displayValue}
            </Typography>
        </Stack>
    );
}

// function renderReminderStatusChip(statusCode: string, statusName: string) {
//     switch (statusCode) {
//         case "completed":
//             return <Chip label={statusName} color="success" size="small" />;
//         case "planned":
//             return <Chip label={statusName} variant="outlined" size="small" />;
//         case "cancelled":
//             return <Chip label={statusName} color="default" size="small" />;
//         default:
//             return <Chip label={statusName} variant="outlined" size="small" />;
//     }
// }

export function PermitDetail({
    permit,
    reminders,
    showHardDeleteButton = false,
}: Props) {
    return (
        <Box>
            <Container maxWidth="lg" sx={{ p: 2 }}>
                <Stack spacing={3}>
                    <AssetsBreadcrumbs
                        items={[
                            { title: "許認可一覧", href: "/permits" },
                            { title: `詳細${permit.permit_number ? ` (${permit.permit_number})` : "" }` },
                        ]}
                        />

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 'bold', px: 1 }}
                                >
                                許認可詳細
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <Button
                                color="warning"
                                component={Link}
                                href={`/permits/${permit.id}/edit`}
                                size="small"
                                startIcon={<EditIcon />}
                                >
                                編集
                            </Button>
                            <PermitDeleteConfirmDialog permit={permit} />

                            {showHardDeleteButton ? (
                                <Card>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Typography variant="h6" fontWeight={700}>
                                                管理者向け操作
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                関連データが無い場合のみ完全削除できます。
                                            </Typography>
                                            <PermitHardDeleteButton permitId={permit.id} />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </Stack>
                    </Stack>

                    <Box>
                        <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                            基本情報
                        </Typography>
                        <Card sx={{ p: 2 }} elevation={4}>
                            <CardContent>
                                <Stack spacing={2}>
                                    {/* <Typography variant="h6" fontWeight={700}>
                                        基本情報
                                    </Typography>

                                    <Divider /> */}

                                    <Grid container spacing={4}>
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                            <RowItem label="分類" value={permit.category_name} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                            <RowItem label="対象" value={permit.subject_name} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                            <RowItem label="業" value={permit.business_name} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                            <RowItem label="許可番号" value={permit.permit_number} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                            <RowItem label="許可日 / 発行日" value={permit.issued_on} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                            <RowItem
                                                label="更新頻度"
                                                value={permit.required_interval_label}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <RowItem
                                                label="先行許可証の提示が必要"
                                                value={permit.requires_prior_certificate}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <RowItem label="備考" value={permit.note} />
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                            リマインダーリスト
                        </Typography>
                        <Card sx={{ p: 2 }} elevation={4}>
                            <CardContent>
                                <Stack spacing={2}>
                                    {reminders.length === 0 ? (
                                        <Alert severity="info">
                                            まだ登録されていません。
                                        </Alert>
                                    ) : (
                                        <Stack>
                                            {reminders.map((row) => (
                                                <Box key={row.id} sx={{ mx: 1 }}>
                                                    <Stack spacing={2}>
                                                        <Grid container spacing={2}>
                                                            <Grid size={{ xs: 12, md: 3 }}>
                                                                <RowItem label="対象日" value={row.due_on} />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, md: 3 }}>
                                                                <RowItem label="通知日" value={row.alert_on} />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, md: 3 }}>
                                                                <RowItem label="完了日" value={row.completed_on} />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, md: 3 }}>
                                                                <RowItem
                                                                    label="補足メモ"
                                                                    value={row.reminder_memo}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Stack>
                                                    <Divider sx={{ my: 1 }} />
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                            システム情報
                        </Typography>
                        <Card sx={{ p: 2 }} elevation={4}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Grid container spacing={4}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Stack direction={"row"} spacing={4}>
                                                <RowItem label="作成日時" value={format(permit.created_at, "yyyy-MM-dd HH:mm:ss", { locale: ja })} />
                                                <RowItem label="作成者" value={permit.created_by_name} />
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Stack direction={"row"} spacing={4}>
                                                <RowItem label="更新日時" value={format(permit.updated_at, "yyyy-MM-dd HH:mm:ss", { locale: ja })} />
                                                <RowItem label="更新者" value={permit.updated_by_name} />
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Stack direction={"row"} spacing={4}>
                                                <RowItem label="削除日時" value={permit.deleted_at && format(permit.deleted_at, "yyyy-MM-dd HH:mm:ss", { locale: ja })} />
                                                <RowItem label="削除者" value={permit.deleted_by_name} />
                                                <RowItem label="削除理由" value={permit.delete_reason} />
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
