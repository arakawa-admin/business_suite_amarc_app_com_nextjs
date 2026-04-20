"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formDataToMasterVehicleInsuranceCategoryInput } from "../helpers/masterVehicleInsuranceCategoryFormData";
import { resolveMasterRepositoryErrorMessage } from "../../../shared/helpers/masterRepositoryError";
import { vehicleInsuranceCategorySchema } from "../schemas/vehicleInsuranceCategorySchema";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import { createVehicleInsuranceCategory } from "../repositories/vehicleInsuranceCategoryRepository";

export async function createVehicleInsuranceCategoryAction(
    _prevState: MasterFormActionState,
    formData: FormData,
): Promise<MasterFormActionState> {
    const parsed = vehicleInsuranceCategorySchema.safeParse(
        formDataToMasterVehicleInsuranceCategoryInput(formData),
    );

    if (!parsed.success) {
        return {
            ok: false,
            fieldErrors: parsed.error.flatten().fieldErrors,
            formError: "入力内容を確認してください",
        };
    }

    try {
        await createVehicleInsuranceCategory(parsed.data);
    } catch (error) {
        return {
            ok: false,
            fieldErrors: {},
            formError: resolveMasterRepositoryErrorMessage(
                error,
                "車両保険カテゴリーの作成に失敗しました",
            ),
        };
    }

    revalidatePath("/admin/vehicle/vehicle-insurance-categories");
    redirect("/admin/vehicle/vehicle-insurance-categories");
}
