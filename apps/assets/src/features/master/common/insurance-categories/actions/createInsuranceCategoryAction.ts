"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formDataToMasterInsuranceCategoryInput } from "../helpers/masterInsuranceCategoryFormData";
import { resolveMasterRepositoryErrorMessage } from "../../../shared/helpers/masterRepositoryError";
import { insuranceCategorySchema } from "../schemas/insuranceCategorySchema";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import { createInsuranceCategory } from "../repositories/insuranceCategoryRepository";

export async function createInsuranceCategoryAction(
    _prevState: MasterFormActionState,
    formData: FormData,
): Promise<MasterFormActionState> {
    const parsed = insuranceCategorySchema.safeParse(
        formDataToMasterInsuranceCategoryInput(formData),
    );

    if (!parsed.success) {
        return {
            ok: false,
            fieldErrors: parsed.error.flatten().fieldErrors,
            formError: "入力内容を確認してください",
        };
    }

    try {
        await createInsuranceCategory(parsed.data);
    } catch (error) {
        return {
            ok: false,
            fieldErrors: {},
            formError: resolveMasterRepositoryErrorMessage(
                error,
                "保険カテゴリーの作成に失敗しました",
            ),
        };
    }

    revalidatePath("/admin/common/insurance-categories");
    redirect("/admin/common/insurance-categories");
}
