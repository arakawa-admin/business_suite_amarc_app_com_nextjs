import { Box, Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { updateVehicleInsuranceAgencyAction } from "@/features/master/vehicle/vehicle-insurance-agencies/actions/vehicleInsuranceAgencyAction";
import { VehicleInsuranceAgencyForm } from "@/features/master/vehicle/vehicle-insurance-agencies/components/VehicleInsuranceAgencyForm";
import { findVehicleInsuranceAgencyById } from "@/features/master/vehicle/vehicle-insurance-agencies/repositories/vehicleInsuranceAgencyRepository";
import { createMasterFormValuesFromRow } from "@/features/master/vehicle/vehicle-insurance-agencies/helpers/masterVehicleInsuranceAgencyFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";
import { findVehicleInsuranceCategoryList } from "@/features/master/vehicle/vehicle-insurance-categories/repositories/vehicleInsuranceCategoryRepository";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditVehicleInsuranceAgencyPage({ params }: Props) {
    const { id } = await params;
    const item = await findVehicleInsuranceAgencyById(id);

    if (!item) {
        notFound();
    }
    const categoryOptions = await findVehicleInsuranceCategoryList();

    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "車両保険契約先 一覧", href: "/admin/vehicle/vehicle-insurance-agencies" },
                            { title: `編集` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>車両保険契約先 編集</Typography>

                    <VehicleInsuranceAgencyForm
                        defaultValues={createMasterFormValuesFromRow(item)}
                        action={updateVehicleInsuranceAgencyAction.bind(null, id)}
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
