import { Box, Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { updateInsuranceCategoryAction } from "@/features/master/common/insurance-categories/actions/updateInsuranceCategoryAction";
import { InsuranceCategoryForm } from "@/features/master/common/insurance-categories/components/InsuranceCategoryForm";
import { findInsuranceCategoryById } from "@/features/master/common/insurance-categories/repositories/insuranceCategoryRepository";
import { createMasterFormValuesFromRow } from "@/features/master/common/insurance-categories/helpers/masterInsuranceCategoryFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditInsuranceCategoryPage({ params }: Props) {
    const { id } = await params;
    const item = await findInsuranceCategoryById(id);

    if (!item) {
        notFound();
    }
    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "保険カテゴリー 一覧", href: "/admin/common/insurance-categories" },
                            { title: `編集` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>保険カテゴリー 編集</Typography>

                    <InsuranceCategoryForm
                        defaultValues={createMasterFormValuesFromRow(item)}
                        action={updateInsuranceCategoryAction.bind(null, id)}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
