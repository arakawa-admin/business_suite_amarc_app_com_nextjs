import { Box, Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { updateVehicleInsuranceCategoryAction } from "@/features/master/vehicle/vehicle-insurance-categories/actions/updateVehicleInsuranceCategoryAction";
import { VehicleInsuranceCategoryForm } from "@/features/master/vehicle/vehicle-insurance-categories/components/VehicleInsuranceCategoryForm";
import { findVehicleInsuranceCategoryById } from "@/features/master/vehicle/vehicle-insurance-categories/repositories/vehicleInsuranceCategoryRepository";
import { createMasterFormValuesFromRow } from "@/features/master/vehicle/vehicle-insurance-categories/helpers/masterVehicleInsuranceCategoryFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditVehicleInsuranceCategoryPage({ params }: Props) {
    const { id } = await params;
    const item = await findVehicleInsuranceCategoryById(id);

    if (!item) {
        notFound();
    }
    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "車両保険カテゴリー 一覧", href: "/admin/vehicle/vehicle-insurance-categories" },
                            { title: `編集` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>車両保険カテゴリー 編集</Typography>

                    <VehicleInsuranceCategoryForm
                        defaultValues={createMasterFormValuesFromRow(item)}
                        action={updateVehicleInsuranceCategoryAction.bind(null, id)}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
