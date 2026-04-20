import { Box, Button, Stack, Typography, Link } from "@mui/material";
import { PermitCategoryList } from "@/features/master/permit/permit-categories/components/PermitCategoryList";
import { findPermitCategoryList } from "@/features/master/permit/permit-categories/repositories/permitCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function PermitCategoriesPage() {
    const rows = await findPermitCategoryList();
    return (
        <Stack spacing={2}>
            <MasterBreadcrumbs
                items={[
                    { title: "許認可カテゴリー 一覧" },
                ]}
                />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: "bold", px: 2 }}>許認可カテゴリーマスタ</Typography>

                <Button
                    component={Link}
                    href="/admin/permit/permit-categories/new"
                    variant="contained"
                >
                    新規作成
                </Button>
            </Stack>

            <Box>
                <PermitCategoryList rows={rows} />
            </Box>
        </Stack>
    );
}
