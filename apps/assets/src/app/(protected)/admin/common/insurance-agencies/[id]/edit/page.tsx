import { Box, Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { updateInsuranceAgencyAction } from "@/features/master/common/insurance-agencies/actions/insuranceAgencyAction";
import { InsuranceAgencyForm } from "@/features/master/common/insurance-agencies/components/InsuranceAgencyForm";
import { findInsuranceAgencyById } from "@/features/master/common/insurance-agencies/repositories/insuranceAgencyRepository";
import { createMasterFormValuesFromRow } from "@/features/master/common/insurance-agencies/helpers/masterInsuranceAgencyFormValue";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";
import { findInsuranceCategoryList } from "@/features/master/common/insurance-categories/repositories/insuranceCategoryRepository";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditInsuranceAgencyPage({ params }: Props) {
    const { id } = await params;
    const item = await findInsuranceAgencyById(id);

    if (!item) {
        notFound();
    }
    const categoryOptions = await findInsuranceCategoryList();

    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <MasterBreadcrumbs
                        items={[
                            { title: "保険契約先 一覧", href: "/admin/common/insurance-agencies" },
                            { title: `編集` },
                        ]}
                        />

                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>保険契約先 編集</Typography>

                    <InsuranceAgencyForm
                        defaultValues={createMasterFormValuesFromRow(item)}
                        action={updateInsuranceAgencyAction.bind(null, id)}
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
