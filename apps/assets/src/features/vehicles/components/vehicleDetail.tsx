"use client";

import Link from "next/link";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import type {
    VehicleDetailItem,
    VehicleReminderViewRow,
} from "../types/vehicleTypes";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";
// import { VehicleDeleteConfirmDialog } from "./vehicleDeleteConfirmDialog";
// import { VehicleHardDeleteButton } from "./vehicleHardDeleteButton";
import { VehicleCommentList } from "@/features/vehicles/comments/components/VehicleCommentList";

import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import PreviewGrid from "@ui/form/file/PreviewGrid";
import { type AttachmentFormItem, toAttachmentPreviewItems } from "@/features/attachments/types/attachmentUiTypes";
// import { type CommentListItem } from "@/features/vehicles/comments/repositories/commentRepository";
// import { VehicleCommentRegisterButton } from "@/features/vehicles/comments/components/VehicleCommentRegisterButton";
import { ReminderCommentRegisterButton } from "@/features/vehicles/comments/components/ReminderCommentRegisterButton";

// type VehicleReminderViewRowWithComment = VehicleReminderViewRow & {
//     comments: CommentListItem[];
// }
type Props = {
    vehicle: VehicleDetailItem;
    reminders: VehicleReminderViewRow[];
    attachments: AttachmentFormItem[];
    // comments?: CommentListItem[];
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

export function VehicleDetail({
    vehicle,
    reminders,
    attachments,
    // comments,
    showHardDeleteButton = false,
}: Props) {
    return (
        <Stack spacing={4}>
            <Box>
                <Container maxWidth="lg">
                    <AssetsBreadcrumbs
                        items={[
                            { title: "車両一覧", href: "/vehicles" },
                            { title: `詳細${vehicle.registrationNumber ? ` (${vehicle.registrationNumber})` : ""}` },
                        ]}
                    />
                </Container>
            </Box>
            <Box>
                <Container maxWidth="lg">
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            gap={2}
                            >
                            <Box>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 'bold', px: 1 }}
                                    >
                                    車両詳細
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    color="warning"
                                    component={Link}
                                    href={`/vehicles/${vehicle.id}/edit`}
                                    size="small"
                                    startIcon={<EditIcon />}
                                    >
                                    編集
                                </Button>
                                {/* TODO */}
                                {/* <VehicleDeleteConfirmDialog vehicle={vehicle} /> */}

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
                                                {/* <VehicleHardDeleteButton vehicleId={vehicle.id} /> */}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ) : null}
                            </Stack>
                        </Stack>

                        <Paper variant="outlined" sx={{ p: 3 }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                        基本情報
                                    </Typography>
                                    <Card sx={{ p: 2 }} variant="outlined">
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <Typography variant="h6" fontWeight={700}>
                                                    基本情報
                                                </Typography>

                                                <Divider />

                                                <Grid container spacing={4}>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="登録番号" value={vehicle.registrationNumber} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="使用部門" value={vehicle.departmentName} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="メーカー名" value={vehicle.manufacturerName} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="車名" value={vehicle.vehicleName} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="タイプ" value={vehicle.typeName} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="型式" value={vehicle.model} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="車台番号又は製造番号" value={vehicle.serialNumber} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="初年度登録年月" value={vehicle.firstRegisteredYm} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="所有者" value={vehicle.ownerName} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="固定資産計上の有無" value={vehicle.isFixedAsset ? "有" : "無"} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="番号登録の有無" value={vehicle.isRegistered ? "有" : "無"} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                                        <RowItem label="代理店名" value={vehicle.compulsoryInsuranceAgencyName} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <RowItem label="備考" value={vehicle.note} />
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>

                                {attachments.length > 0 && (
                                <Box>
                                    <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                        添付ファイル
                                    </Typography>
                                    <Card sx={{ p: 2 }} variant="outlined">
                                        <CardContent>
                                            <PreviewGrid
                                                previews={toAttachmentPreviewItems(attachments)}
                                                />
                                        </CardContent>
                                    </Card>
                                </Box>
                                )}

                                <Box>
                                    <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                        リマインダーリスト
                                    </Typography>
                                    <Card sx={{ p: 2 }} variant="outlined">
                                        <CardContent>
                                            <Stack spacing={2}>
                                                {reminders.length === 0 ? (
                                                    <Alert severity="info">
                                                        まだ登録されていません。
                                                    </Alert>
                                                ) : (
                                                    <Stack spacing={0.5}>
                                                        {reminders.map((row, index) => (
                                                            <Paper key={row.id} sx={{ p: 2 }} variant="outlined">
                                                                <Stack spacing={2}>
                                                                    <Stack direction={"row"} flexWrap={"wrap"} gap={2} alignItems={"center"} justifyContent={"space-between"}>
                                                                        <Box>
                                                                            <Avatar
                                                                                sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 14 }}
                                                                                >{index+1}</Avatar>
                                                                        </Box>
                                                                        <Box>
                                                                            <Chip label={`車検月`} sx={{ mr: 1 }} />
                                                                            <Typography variant="body2" component={"span"}>{row.due_on ? format(row.due_on, "yyyy/MM") : "-"}</Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Chip label={`通知日`} sx={{ mr: 1 }} />
                                                                            <Typography variant="body2" component={"span"}>{row.alert_on ?? "-"}</Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <Chip label={`完了日`} sx={{ mr: 1 }} />
                                                                            <Typography variant="body2" component={"span"}>{row.completed_on ?? "-"}</Typography>
                                                                        </Box>
                                                                        <Box>
                                                                            <ReminderCommentRegisterButton reminderId={row.id} />
                                                                        </Box>
                                                                    </Stack>
                                                                    {row.comments.length > 0 && (
                                                                        <Box sx={{ bgcolor: "#fafafa", borderRadius: 1, p: 1 }}>
                                                                            <VehicleCommentList comments={row.comments} vehicleId={vehicle.id} />
                                                                        </Box>
                                                                    )}
                                                                </Stack>
                                                            </Paper>
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
                                    <Card sx={{ p: 2 }} variant="outlined">
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <Grid container spacing={4}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Stack direction={"row"} spacing={4}>
                                                            <RowItem label="作成日時" value={format(vehicle.createdAt, "yyyy-MM-dd HH:mm:ss", { locale: ja })} />
                                                            {/* TODO */}
                                                            {/* <RowItem label="作成者" value={vehicle.createdBy} /> */}
                                                        </Stack>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Stack direction={"row"} spacing={4}>
                                                            <RowItem label="更新日時" value={format(vehicle.updatedAt, "yyyy-MM-dd HH:mm:ss", { locale: ja })} />
                                                            {/* TODO */}
                                                            {/* <RowItem label="更新者" value={vehicle.updated_by_name} /> */}
                                                        </Stack>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Stack direction={"row"} spacing={4}>
                                                            <RowItem label="削除日時" value={vehicle.deletedAt} />
                                                            <RowItem label="削除者" value={vehicle.deletedBy} />
                                                            <RowItem label="削除理由" value={vehicle.deleteReason} />
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>

                                {/* TODO */}
                                {/* <Box sx={{ bgcolor: "#fafafa", borderRadius: 1, p: 1 }}>
                                    <Stack spacing={1}>
                                        <VehicleCommentList comments={comments} vehicleId={vehicle.id} />

                                        <Box>
                                            <VehicleCommentRegisterButton vehicleId={vehicle.id} />
                                        </Box>
                                    </Stack>
                                </Box> */}
                            </Stack>
                        </Paper>
                    </Stack>
                </Container>
            </Box>
        </Stack>
    );
}
