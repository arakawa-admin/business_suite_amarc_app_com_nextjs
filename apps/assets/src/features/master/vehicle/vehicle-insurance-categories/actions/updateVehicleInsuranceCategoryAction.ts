"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formDataToMasterCommonInput } from "../../../shared/helpers/masterFormData";
import { resolveMasterRepositoryErrorMessage } from "../../../shared/helpers/masterRepositoryError";
import { vehicleInsuranceCategorySchema } from "../schemas/vehicleInsuranceCategorySchema";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import { updateVehicleInsuranceCategory } from "../repositories/vehicleInsuranceCategoryRepository";

export async function updateVehicleInsuranceCategoryAction(
    id: string,
    _prevState: MasterFormActionState,
    formData: FormData,
): Promise<MasterFormActionState> {
    const parsed = vehicleInsuranceCategorySchema.safeParse(
        formDataToMasterCommonInput(formData),
    );

    if (!parsed.success) {
        return {
            ok: false,
            fieldErrors: parsed.error.flatten().fieldErrors,
            formError: "入力内容を確認してください",
        };
    }

    try {
        await updateVehicleInsuranceCategory(id, parsed.data);
    } catch (error) {
        return {
            ok: false,
            fieldErrors: {},
            formError: resolveMasterRepositoryErrorMessage(
                error,
                "車両保険カテゴリーの更新に失敗しました",
            ),
        };
    }

    revalidatePath("/admin/vehicle/vehicle-insurance-categories");
    revalidatePath(`/admin/vehicle/vehicle-insurance-categories/${id}`);
    revalidatePath(`/admin/vehicle/vehicle-insurance-categories/${id}/edit`);

    redirect(`/admin/vehicle/vehicle-insurance-categories/${id}`);
}
