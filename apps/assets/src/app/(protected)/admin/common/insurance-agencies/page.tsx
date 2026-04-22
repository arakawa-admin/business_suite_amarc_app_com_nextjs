import { Box, Button, Stack, Typography, Link } from "@mui/material";
import { InsuranceAgencyList } from "@/features/master/common/insurance-agencies/components/InsuranceAgencyList";
import { findInsuranceAgencyList } from "@/features/master/common/insurance-agencies/repositories/insuranceAgencyRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function InsuranceCategoriesPage() {
    const rows = await findInsuranceAgencyList();
    return (
        <Stack spacing={2}>
            <MasterBreadcrumbs
                items={[
                    { title: "保険契約先 一覧" },
                ]}
                />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: "bold", px: 2 }}>保険契約先マスタ</Typography>

                <Button
                    component={Link}
                    href="/admin/common/insurance-agencies/new"
                    variant="contained"
                >
                    新規作成
                </Button>
            </Stack>

            <Box>
                <InsuranceAgencyList rows={rows} detailBasePath="/admin/common/insurance-agencies" />
            </Box>
        </Stack>
    );
}
