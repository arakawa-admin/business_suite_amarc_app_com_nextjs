import {
    createMaster,
    findActiveMasterOptions,
    findMasterById,
    findMasterList,
    updateMaster,
} from "../../../shared/repositories/masterCrudRepository";
import type { PermitCategory, PermitCategoryFormValues } from "../types/permitCategoryTypes";
import { permitCategoryMapper } from "../mappers/permitCategoryMapper";

const TABLE = "master_permit_categories" as const;

export async function findPermitCategoryList(): Promise<
    PermitCategory[]
> {
    return findMasterList<PermitCategory>(
        TABLE,
        permitCategoryMapper,
    );
}

export async function findPermitCategoryById(
    id: string,
): Promise<PermitCategory | null> {
    return findMasterById<PermitCategory>(
        TABLE,
        id,
        permitCategoryMapper,
    );
}

export async function createPermitCategory(
    input: PermitCategoryFormValues,
): Promise<void> {
    return createMaster<PermitCategoryFormValues>(
        TABLE,
        input,
        permitCategoryMapper,
    );
}

export async function updatePermitCategory(
    id: string,
    input: PermitCategoryFormValues,
): Promise<void> {
    return updateMaster<PermitCategoryFormValues>(
        TABLE,
        id,
        input,
        permitCategoryMapper,
    );
}

export async function findActivePermitCategoryOptions() {
    return findActiveMasterOptions<PermitCategory>(
        TABLE,
        permitCategoryMapper,
    );
}


