import { Container, Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { VehicleInsuranceCategoryDetail } from "@/features/master/vehicle/vehicle-insurance-categories/components/VehicleInsuranceCategoryDetail";
import { findVehicleInsuranceCategoryById } from "@/features/master/vehicle/vehicle-insurance-categories/repositories/vehicleInsuranceCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PermitCategoryDetailPage({ params }: Props) {
    const { id } = await params;
    const item = await findVehicleInsuranceCategoryById(id);

    if (!item) {
        notFound();
    }

    return (
        <Container>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MasterBreadcrumbs
                    items={[
                        { title: "車両保険カテゴリー 一覧", href: "/admin/vehicle/vehicle-insurance-categories" },
                        { title: `詳細 (${item.name})` },
                    ]}
                    />

                <VehicleInsuranceCategoryDetail item={item} />
            </Stack>
        </Container>
    );
}
