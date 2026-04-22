import { Box, Button, Stack, Typography, Link } from "@mui/material";
import { InsuranceCategoryList } from "@/features/master/common/insurance-categories/components/InsuranceCategoryList";
import { findInsuranceCategoryList } from "@/features/master/common/insurance-categories/repositories/insuranceCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function InsuranceCategoriesPage() {
    const rows = await findInsuranceCategoryList();
    return (
        <Stack spacing={2}>
            <MasterBreadcrumbs
                items={[
                    { title: "保険カテゴリー 一覧" },
                ]}
                />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: "bold", px: 2 }}>保険カテゴリーマスタ</Typography>

                <Button
                    component={Link}
                    href="/admin/common/insurance-categories/new"
                    variant="contained"
                >
                    新規作成
                </Button>
            </Stack>

            <Box>
                <InsuranceCategoryList rows={rows} />
            </Box>
        </Stack>
    );
}
