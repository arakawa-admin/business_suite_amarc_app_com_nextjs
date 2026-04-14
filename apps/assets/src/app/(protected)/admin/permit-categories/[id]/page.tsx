import { Container, Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { PermitCategoryDetail } from "@/features/master/permit-categories/components/PermitCategoryDetail";
import { findPermitCategoryById } from "@/features/master/permit-categories/repositories/permitCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PermitCategoryDetailPage({ params }: Props) {
    const { id } = await params;
    const item = await findPermitCategoryById(id);

    if (!item) {
        notFound();
    }

    return (
        <Container>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MasterBreadcrumbs
                    items={[
                        { title: "許認可分類 一覧", href: "/admin/permit-categories" },
                        { title: `詳細 (${item.name})` },
                    ]}
                    />

                <PermitCategoryDetail item={item} />
            </Stack>
        </Container>
    );
}
