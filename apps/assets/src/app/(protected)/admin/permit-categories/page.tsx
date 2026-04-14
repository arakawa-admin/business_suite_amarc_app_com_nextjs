import { Box, Button, Stack, Typography, Link } from "@mui/material";
import { PermitCategoryList } from "@/features/master/permit-categories/components/PermitCategoryList";
import { findPermitCategoryList } from "@/features/master/permit-categories/repositories/permitCategoryRepository";

export default async function PermitCategoriesPage() {
    const rows = await findPermitCategoryList();
    return (
        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>許認可分類マスタ</Typography>

                <Button
                    component={Link}
                    href="/admin/permit-categories/new"
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
