import { Box, Container, Stack, Typography } from "@mui/material";
import { createInsuranceCategoryAction } from "@/features/master/common/insurance-categories/actions/createInsuranceCategoryAction";
import { InsuranceCategoryForm } from "@/features/master/common/insurance-categories/components/InsuranceCategoryForm";
import { createEmptyMasterFormValues } from "@/features/master/common/insurance-categories/helpers/masterInsuranceCategoryFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default function NewInsuranceCategoryPage() {
    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "保険カテゴリー 一覧", href: "/admin/common/insurance-categories" },
                            { title: `新規作成` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>保険カテゴリー 新規作成</Typography>

                    <InsuranceCategoryForm
                        defaultValues={createEmptyMasterFormValues()}
                        action={createInsuranceCategoryAction}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
