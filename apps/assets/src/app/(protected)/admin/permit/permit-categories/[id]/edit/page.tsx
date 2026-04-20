import { Box, Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { updatePermitCategoryAction } from "@/features/master/permit/permit-categories/actions/updatePermitCategoryAction";
import { PermitCategoryForm } from "@/features/master/permit/permit-categories/components/PermitCategoryForm";
import { findPermitCategoryById } from "@/features/master/permit/permit-categories/repositories/permitCategoryRepository";
import { createMasterFormValuesFromRow } from "@/features/master/shared/helpers/masterFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

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
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "許認可カテゴリー 一覧", href: "/admin/permit/permit-categories" },
                            { title: `新規作成` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>許認可カテゴリー 編集</Typography>

                    <PermitCategoryForm
                        defaultValues={createMasterFormValuesFromRow(item)}
                        action={updatePermitCategoryAction.bind(null, id)}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
