import { Container, Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { VehicleInsuranceAgencyDetail } from "@/features/master/vehicle/vehicle-insurance-agencies/components/VehicleInsuranceAgencyDetail";
import { findVehicleInsuranceAgencyById } from "@/features/master/vehicle/vehicle-insurance-agencies/repositories/vehicleInsuranceAgencyRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PermitAgencyDetailPage({ params }: Props) {
    const { id } = await params;
    const item = await findVehicleInsuranceAgencyById(id);

    if (!item) {
        notFound();
    }

    return (
        <Container>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MasterBreadcrumbs
                    items={[
                        { title: "車両保険契約先 一覧", href: "/admin/vehicle/vehicle-insurance-agencies" },
                        { title: `詳細 (${item.agencyName})` },
                    ]}
                    />

                <VehicleInsuranceAgencyDetail
                    item={item}
                    editHref={`/admin/vehicle/vehicle-insurance-agencies/${item.id}/edit`}
                />
            </Stack>
        </Container>
    );
}
