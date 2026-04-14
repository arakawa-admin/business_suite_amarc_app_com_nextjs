"use server";

import {
    StaffDepartmentCreateInput,
    StaffDepartmentUpdatePayload,
} from "@/schemas/common/staffDepartmentSchema";

import { revalidatePath } from "next/cache";

import { subDays } from "date-fns";

import {
    fetchStaffDepartments,
    fetchStaffDepartmentById,
    insertStaffDepartment,
    updateStaffDepartmentById,
    updateStaffAndDepartmentById,
    updateStaffDepartmentInvalidAt,
} from "@/lib/repositories/common/staffDepartment.repository";

export async function getStaffDepartments() {
    return await fetchStaffDepartments();
}

export async function getStaffDepartmentById(id: string) {
    return fetchStaffDepartmentById(id);
}

export async function createStaffDepartment(data: StaffDepartmentCreateInput) {
    await insertStaffDepartment(data);
    revalidatePath("/");
}

export async function updateStaffDepartment(
    id: string,
    data: StaffDepartmentUpdatePayload
) {
    await updateStaffDepartmentById(id, data);
    revalidatePath("/");
}

export async function updateStaffAndDepartments(
    staff_id: string,
    department_ids: string[]
) {
    await updateStaffAndDepartmentById(staff_id, department_ids);
    revalidatePath("/");
}

// 有効化
export async function enableStaffDepartment(id: string) {
    try {
        await updateStaffDepartmentInvalidAt(id, new Date('2050-12-31'));
        revalidatePath("/");
    } catch {
        throw new Error("スタッフ所属部門の有効化に失敗しました");
    }
}


// 無効化
export async function disableStaffDepartment(id: string) {
    try {
        const yesterday = subDays(new Date(), 1);
        await updateStaffDepartmentInvalidAt(id, yesterday);
        revalidatePath("/");
    } catch {
        throw new Error("スタッフ所属部門の無効化に失敗しました");
    }
}
