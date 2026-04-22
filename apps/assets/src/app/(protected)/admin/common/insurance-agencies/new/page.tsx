import { Box, Container, Stack, Typography } from "@mui/material";
import { InsuranceAgencyForm } from "@/features/master/common/insurance-agencies/components/InsuranceAgencyForm";

import { createEmptyMasterFormValues } from "@/features/master/common/insurance-agencies/helpers/masterInsuranceAgencyFormValue";
import { createInsuranceAgencyAction } from "@/features/master/common/insurance-agencies/actions/insuranceAgencyAction";
import { findInsuranceCategoryList } from "@/features/master/common/insurance-categories/repositories/insuranceCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function NewInsuranceAgencyPage() {
    const categoryOptions = await findInsuranceCategoryList();

    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "保険契約先 一覧", href: "/admin/common/insurance-agencies" },
                            { title: `新規作成` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>保険契約先 新規作成</Typography>

                    <InsuranceAgencyForm
                        defaultValues={createEmptyMasterFormValues()}
                        action={createInsuranceAgencyAction}
                        submitLabel="保存"
                        categoryOptions={categoryOptions.map((category) => ({
                            value: category.id,
                            label: category.name,
                        }))}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
