import { Box, Container, Stack, Typography } from "@mui/material";
import { createPermitCategoryAction } from "@/features/master/permit/permit-categories/actions/createPermitCategoryAction";
import { PermitCategoryForm } from "@/features/master/permit/permit-categories/components/PermitCategoryForm";
import { createEmptyMasterFormValues } from "@/features/master/shared/helpers/masterFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default function NewPermitCategoryPage() {
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

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>許認可カテゴリー 新規作成</Typography>

                    <PermitCategoryForm
                        defaultValues={createEmptyMasterFormValues()}
                        action={createPermitCategoryAction}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
