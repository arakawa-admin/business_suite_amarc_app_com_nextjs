import { Stack, Typography } from "@mui/material";
import { createPermitCategoryAction } from "@/features/master/permit-categories/actions/createPermitCategoryAction";
import { PermitCategoryForm } from "@/features/master/permit-categories/components/PermitCategoryForm";
import { createEmptyMasterFormValues } from "@/features/master/shared/helpers/masterFormValue";

export default function NewPermitCategoryPage() {
    return (
        <Stack spacing={3}>
            <Typography variant="h4">許認可分類 新規作成</Typography>

            <PermitCategoryForm
                defaultValues={createEmptyMasterFormValues()}
                action={createPermitCategoryAction}
            />
        </Stack>
    );
}
