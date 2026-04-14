import { Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { updatePermitCategoryAction } from "@/features/master/permit-categories/actions/updatePermitCategoryAction";
import { PermitCategoryForm } from "@/features/master/permit-categories/components/PermitCategoryForm";
import { findPermitCategoryById } from "@/features/master/permit-categories/repositories/permitCategoryRepository";
import { createMasterFormValuesFromRow } from "@/features/master/shared/helpers/masterFormValue";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditPermitCategoryPage({ params }: Props) {
    const { id } = await params;
    const item = await findPermitCategoryById(id);

    if (!item) {
        notFound();
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h4">許認可分類 編集</Typography>

            <PermitCategoryForm
                defaultValues={createMasterFormValuesFromRow(item)}
                action={updatePermitCategoryAction.bind(null, id)}
            />
        </Stack>
    );
}
