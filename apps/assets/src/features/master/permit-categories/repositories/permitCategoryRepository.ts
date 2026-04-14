import {
    createMaster,
    findActiveMasterOptions,
    findMasterById,
    findMasterList,
    updateMaster,
} from "../../shared/repositories/masterCrudRepository";
import type { PermitCategoryFormValues } from "../types/permitCategoryTypes";

const TABLE = "master_permit_categories" as const;

export async function findPermitCategoryList() {
    return findMasterList(TABLE);
}

export async function findPermitCategoryById(id: string) {
    return findMasterById(TABLE, id);
}

export async function createPermitCategory(input: PermitCategoryFormValues) {
    return createMaster(TABLE, input);
}

export async function updatePermitCategory(
    id: string,
    input: PermitCategoryFormValues,
) {
    return updateMaster(TABLE, id, input);
}

export async function findActivePermitCategoryOptions() {
    return findActiveMasterOptions(TABLE);
}
