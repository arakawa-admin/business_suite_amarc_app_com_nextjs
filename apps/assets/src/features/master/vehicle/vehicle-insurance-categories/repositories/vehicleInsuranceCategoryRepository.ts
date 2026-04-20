import {
    createMaster,
    findActiveMasterOptions,
    findMasterById,
    findMasterList,
    updateMaster,
} from "../../../shared/repositories/masterCrudRepository";
import { vehicleInsuranceCategoryMapper } from "../mappers/vehicleInsuranceCategoryMapper";
import type {
    VehicleInsuranceCategory,
    VehicleInsuranceCategoryActionState,
} from "../types/vehicleInsuranceCategoryTypes";
const TABLE = "master_vehicle_insurance_categories" as const;

export async function findVehicleInsuranceCategoryList(): Promise<
    VehicleInsuranceCategory[]
> {
    return findMasterList<VehicleInsuranceCategory>(
        TABLE,
        vehicleInsuranceCategoryMapper,
    );
}

export async function findVehicleInsuranceCategoryById(
    id: string,
): Promise<VehicleInsuranceCategory | null> {
    return findMasterById<VehicleInsuranceCategory>(
        TABLE,
        id,
        vehicleInsuranceCategoryMapper,
    );
}

export async function createVehicleInsuranceCategory(
    input: VehicleInsuranceCategoryActionState,
): Promise<void> {
    return createMaster<VehicleInsuranceCategoryActionState>(
        TABLE,
        input,
        vehicleInsuranceCategoryMapper,
    );
}

export async function updateVehicleInsuranceCategory(
    id: string,
    input: VehicleInsuranceCategoryActionState,
): Promise<void> {
    return updateMaster<VehicleInsuranceCategoryActionState>(
        TABLE,
        id,
        input,
        vehicleInsuranceCategoryMapper,
    );
}

export async function findActiveVehicleInsuranceCategoryOptions() {
    return findActiveMasterOptions<VehicleInsuranceCategory>(
        TABLE,
        vehicleInsuranceCategoryMapper,
    );
}
