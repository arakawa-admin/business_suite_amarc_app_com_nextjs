"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formDataToMasterCommonInput } from "../../../shared/helpers/masterFormData";
import { resolveMasterRepositoryErrorMessage } from "../../../shared/helpers/masterRepositoryError";
import { insuranceCategorySchema } from "../schemas/insuranceCategorySchema";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import { updateInsuranceCategory } from "../repositories/insuranceCategoryRepository";

export async function updateInsuranceCategoryAction(
    id: string,
    _prevState: MasterFormActionState,
    formData: FormData,
): Promise<MasterFormActionState> {
    const parsed = insuranceCategorySchema.safeParse(
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
        await updateInsuranceCategory(id, parsed.data);
    } catch (error) {
        return {
            ok: false,
            fieldErrors: {},
            formError: resolveMasterRepositoryErrorMessage(
                error,
                "保険カテゴリーの更新に失敗しました",
            ),
        };
    }

    revalidatePath("/admin/common/insurance-categories");
    revalidatePath(`/admin/common/insurance-categories/${id}`);
    revalidatePath(`/admin/common/insurance-categories/${id}/edit`);

    redirect(`/admin/common/insurance-categories/${id}`);
}
