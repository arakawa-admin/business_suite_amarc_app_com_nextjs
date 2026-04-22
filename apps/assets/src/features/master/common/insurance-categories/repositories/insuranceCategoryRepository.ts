import {
    createMaster,
    findActiveMasterOptions,
    findMasterById,
    findMasterList,
    updateMaster,
} from "../../../shared/repositories/masterCrudRepository";
import { insuranceCategoryMapper } from "../mappers/insuranceCategoryMapper";
import type {
    InsuranceCategory,
    InsuranceCategoryActionState,
} from "../types/insuranceCategoryTypes";
const TABLE = "master_insurance_categories" as const;

export async function findInsuranceCategoryList(): Promise<
    InsuranceCategory[]
> {
    return findMasterList<InsuranceCategory>(
        TABLE,
        insuranceCategoryMapper,
    );
}

export async function findInsuranceCategoryById(
    id: string,
): Promise<InsuranceCategory | null> {
    return findMasterById<InsuranceCategory>(
        TABLE,
        id,
        insuranceCategoryMapper,
    );
}

export async function createInsuranceCategory(
    input: InsuranceCategoryActionState,
): Promise<void> {
    return createMaster<InsuranceCategoryActionState>(
        TABLE,
        input,
        insuranceCategoryMapper,
    );
}

export async function updateInsuranceCategory(
    id: string,
    input: InsuranceCategoryActionState,
): Promise<void> {
    return updateMaster<InsuranceCategoryActionState>(
        TABLE,
        id,
        input,
        insuranceCategoryMapper,
    );
}

export async function findActiveInsuranceCategoryOptions() {
    return findActiveMasterOptions<InsuranceCategory>(
        TABLE,
        insuranceCategoryMapper,
    );
}
