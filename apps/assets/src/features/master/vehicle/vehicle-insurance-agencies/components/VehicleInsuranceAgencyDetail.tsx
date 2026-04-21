import { Box, Button, Divider, Grid, Link, Paper, Stack, Typography } from "@mui/material";
import { resolveMasterValidityStatus } from "../../../shared/helpers/masterValidity";
import { MasterValidityChip } from "../../../shared/components/MasterValidityChip";
import type { VehicleInsuranceAgency } from "../types/vehicleInsuranceAgencyTypes";

type Props = {
    item: VehicleInsuranceAgency;
    editHref: string;
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("ja-JP");
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Box>{value}</Box>
                <Divider />
            </Stack>
        </Box>
    );
}

export function VehicleInsuranceAgencyDetail({
    item,
    editHref,
}: Props) {
    const status = resolveMasterValidityStatus({
        validAt: item.validAt,
        invalidAt: item.invalidAt,
    });

    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                    {item.insuranceCompanyName}
                    {item.agencyName ? ` / ${item.agencyName}` : ""}
                </Typography>

                <Button component={Link} href={editHref} variant="contained">
                    編集
                </Button>
            </Stack>

            <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="状態" value={<MasterValidityChip status={status} />} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="保険カテゴリ" value={item.insuranceCategoryName} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="保険会社名" value={item.insuranceCompanyName} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="代理店名" value={item.agencyName || "-"} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="担当者名" value={item.contactPersonName || "-"} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="携帯電話" value={item.mobilePhone || "-"} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="電話番号" value={item.tel || "-"} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow label="FAX番号" value={item.fax || "-"} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 12 }}>
                        <DetailRow label="備考" value={item.remarks || "-"} />
                    </Grid>
                </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow
                            label="有効開始日時"
                            value={formatDateTime(item.validAt)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow
                            label="有効終了日時"
                            value={formatDateTime(item.invalidAt)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow
                            label="作成日時"
                            value={formatDateTime(item.createdAt)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <DetailRow
                            label="更新日時"
                            value={formatDateTime(item.updatedAt)}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Stack>
    );
}
