import { Box, Button, Stack, Typography, Link } from "@mui/material";
import { VehicleInsuranceCategoryList } from "@/features/master/vehicle/vehicle-insurance-categories/components/VehicleInsuranceCategoryList";
import { findVehicleInsuranceCategoryList } from "@/features/master/vehicle/vehicle-insurance-categories/repositories/vehicleInsuranceCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function VehicleInsuranceCategoriesPage() {
    const rows = await findVehicleInsuranceCategoryList();
    return (
        <Stack spacing={2}>
            <MasterBreadcrumbs
                items={[
                    { title: "車両保険カテゴリー 一覧" },
                ]}
                />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: "bold", px: 2 }}>車両保険カテゴリーマスタ</Typography>

                <Button
                    component={Link}
                    href="/admin/vehicle/vehicle-insurance-categories/new"
                    variant="contained"
                >
                    新規作成
                </Button>
            </Stack>

            <Box>
                <VehicleInsuranceCategoryList rows={rows} />
            </Box>
        </Stack>
    );
}
