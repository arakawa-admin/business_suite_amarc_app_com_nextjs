import { Box, Container, Stack, Typography } from "@mui/material";
import { VehicleInsuranceAgencyForm } from "@/features/master/vehicle/vehicle-insurance-agencies/components/VehicleInsuranceAgencyForm";

import { createEmptyMasterFormValues } from "@/features/master/vehicle/vehicle-insurance-agencies/helpers/masterVehicleInsuranceAgencyFormValue";
import { createVehicleInsuranceAgencyAction } from "@/features/master/vehicle/vehicle-insurance-agencies/actions/vehicleInsuranceAgencyAction";
import { findVehicleInsuranceCategoryList } from "@/features/master/vehicle/vehicle-insurance-categories/repositories/vehicleInsuranceCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function NewVehicleInsuranceAgencyPage() {
    const categoryOptions = await findVehicleInsuranceCategoryList();

    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "車両保険契約先 一覧", href: "/admin/vehicle/vehicle-insurance-agencies" },
                            { title: `新規作成` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>車両保険契約先 新規作成</Typography>

                    <VehicleInsuranceAgencyForm
                        defaultValues={createEmptyMasterFormValues()}
                        action={createVehicleInsuranceAgencyAction}
                        submitLabel="保存"
                        categoryOptions={categoryOptions.map((category) => ({
                            value: category.id,
                            label: category.name,
                        }))}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
