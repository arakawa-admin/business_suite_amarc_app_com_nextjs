"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formDataToMasterCommonInput } from "../../../shared/helpers/masterFormData";
import { resolveMasterRepositoryErrorMessage } from "../../../shared/helpers/masterRepositoryError";
import { masterCommonSchema } from "../../../shared/schemas/masterCommonSchema";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import { createPermitCategory } from "../repositories/permitCategoryRepository";

export async function createPermitCategoryAction(
    _prevState: MasterFormActionState,
    formData: FormData,
): Promise<MasterFormActionState> {
    const parsed = masterCommonSchema.safeParse(
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
        await createPermitCategory(parsed.data);
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

    revalidatePath("/admin/permit/permit-categories");
    redirect("/admin/permit/permit-categories");
}
