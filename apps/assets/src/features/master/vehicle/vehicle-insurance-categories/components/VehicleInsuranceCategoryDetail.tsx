import { Box, Grid, Stack, Typography, Divider } from "@mui/material";

import { MasterDetailBase } from "../../../shared/components/MasterDetailBase";
import type { VehicleInsuranceCategory } from "../types/vehicleInsuranceCategoryTypes";

type MasterDetailRowProps = {
    label: string;
    value: React.ReactNode;
};
function Row({
    label,
    value,
}: MasterDetailRowProps) {
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

export function VehicleInsuranceCategoryDetail({ item }: { item: VehicleInsuranceCategory }) {
    return (
        <MasterDetailBase
            item={item}
            editHref={`/admin/vehicle/vehicle-insurance-categories/${item.id}/edit`}
            renderExtraRows={() => (
                <>
                <Grid size={{ xs: 12 }}>
                    <Row label="更新時対応メモ" value={item.updateNote} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Row label="事故時 社内対応メモ" value={item.accidentInternalNote} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Row label="事故時 社外対応メモ" value={item.accidentExternalNote} />
                </Grid>
                </>
            )}
        />
    );
}
