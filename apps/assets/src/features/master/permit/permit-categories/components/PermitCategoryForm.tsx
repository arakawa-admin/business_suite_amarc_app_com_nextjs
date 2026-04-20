"use client";

import { MasterFormBase } from "../../../shared/components/MasterFormBase";
import type { MasterCommonFormValues } from "../../../shared/types/masterCommonTypes";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";

type Props = {
    defaultValues: MasterCommonFormValues;
    action: (
        prevState: MasterFormActionState,
        formData: FormData,
    ) => Promise<MasterFormActionState>;
};

export function PermitCategoryForm(props: Props) {
    return <MasterFormBase {...props} />;
}
