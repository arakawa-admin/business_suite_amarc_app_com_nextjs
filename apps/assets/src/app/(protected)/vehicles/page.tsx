import { findVehicleList } from "@/features/vehicles/repositories/vehicleRepository";
import { VehicleList } from "@/features/vehicles/components/vehicleList";

import { getMasterDepartments } from "@lib/actions/common/masterDepartment";

type Props = {
    searchParams: Promise<{
        q?: string;
        departmentId?: string;
        // status?: "unknown" | "expired" | "alert_due" | "active";
    }>;
};

export default async function VehicleListPage({ searchParams }: Props) {
    const params = await searchParams;

    const rows = await findVehicleList({
        q: params.q,
        departmentId: params.departmentId,
        // status: params.status,
    });

    const { data: departmentList } = await getMasterDepartments();
    const departmentOptions = departmentList.map((item: any) => ({ id: item.id, name: item.name }));

    return <VehicleList rows={rows} departmentOptions={departmentOptions} />;
}
