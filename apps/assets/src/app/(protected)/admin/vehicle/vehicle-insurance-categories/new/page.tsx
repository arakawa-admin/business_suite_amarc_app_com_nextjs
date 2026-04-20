import { Box, Container, Stack, Typography } from "@mui/material";
import { createVehicleInsuranceCategoryAction } from "@/features/master/vehicle/vehicle-insurance-categories/actions/createVehicleInsuranceCategoryAction";
import { VehicleInsuranceCategoryForm } from "@/features/master/vehicle/vehicle-insurance-categories/components/VehicleInsuranceCategoryForm";
import { createEmptyMasterFormValues } from "@/features/master/vehicle/vehicle-insurance-categories/helpers/masterVehicleInsuranceCategoryFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default function NewVehicleInsuranceCategoryPage() {
    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "車両保険カテゴリー 一覧", href: "/admin/vehicle/vehicle-insurance-categories" },
                            { title: `新規作成` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>車両保険カテゴリー 新規作成</Typography>

                    <VehicleInsuranceCategoryForm
                        defaultValues={createEmptyMasterFormValues()}
                        action={createVehicleInsuranceCategoryAction}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
