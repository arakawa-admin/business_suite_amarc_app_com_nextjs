import { Box, Button, Grid, Paper, Stack, Typography, Link, Divider } from "@mui/material";
import { resolveMasterValidityStatus } from "../helpers/masterValidity";
import { MasterValidityChip } from "./MasterValidityChip";
import type { MasterCommonRow } from "../types/masterCommonTypes";

type Props = {
    item: MasterCommonRow;
    editHref: string;
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("ja-JP");
}

function Row({
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

export function MasterDetailBase({ item, editHref }: Props) {
    const status = resolveMasterValidityStatus(item);

    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{item.name}</Typography>

                <Button component={Link} href={editHref} variant="contained">
                    編集
                </Button>
            </Stack>
            <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="コード" value={item.code} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="名称" value={item.name} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="状態" value={<MasterValidityChip status={status} />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="表示順" value={item.sortOrder} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="備考" value={item.remarks || "-"} />
                        </Grid>
                    </Grid>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="有効開始日時" value={formatDateTime(item.validAt)} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="有効終了日時" value={formatDateTime(item.invalidAt)} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="作成日時" value={formatDateTime(item.createdAt)} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Row label="更新日時" value={formatDateTime(item.updatedAt)} />
                        </Grid>
                    </Grid>
                </Paper>
            </Stack>
        </Stack>
    );
}
