import { MasterListBase } from "../../../shared/components/MasterListBase";
import type { VehicleInsuranceCategory } from "../types/vehicleInsuranceCategoryTypes";

export function VehicleInsuranceCategoryList({ rows }: { rows: VehicleInsuranceCategory[] }) {
    return (
        <MasterListBase
            rows={rows}
            detailBasePath="/admin/vehicle/vehicle-insurance-categories"
        />
    );
}
