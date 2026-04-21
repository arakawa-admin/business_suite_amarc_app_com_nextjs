import { Box, Button, Stack, Typography, Link } from "@mui/material";
import { VehicleInsuranceAgencyList } from "@/features/master/vehicle/vehicle-insurance-agencies/components/VehicleInsuranceAgencyList";
import { findVehicleInsuranceAgencyList } from "@/features/master/vehicle/vehicle-insurance-agencies/repositories/vehicleInsuranceAgencyRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function VehicleInsuranceCategoriesPage() {
    const rows = await findVehicleInsuranceAgencyList();
    return (
        <Stack spacing={2}>
            <MasterBreadcrumbs
                items={[
                    { title: "車両保険契約先 一覧" },
                ]}
                />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: "bold", px: 2 }}>車両保険契約先マスタ</Typography>

                <Button
                    component={Link}
                    href="/admin/vehicle/vehicle-insurance-agencies/new"
                    variant="contained"
                >
                    新規作成
                </Button>
            </Stack>

            <Box>
                <VehicleInsuranceAgencyList rows={rows} detailBasePath="/admin/vehicle/vehicle-insurance-agencies" />
            </Box>
        </Stack>
    );
}
