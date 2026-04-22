import { Container, Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { InsuranceCategoryDetail } from "@/features/master/common/insurance-categories/components/InsuranceCategoryDetail";
import { findInsuranceCategoryById } from "@/features/master/common/insurance-categories/repositories/insuranceCategoryRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PermitCategoryDetailPage({ params }: Props) {
    const { id } = await params;
    const item = await findInsuranceCategoryById(id);

    if (!item) {
        notFound();
    }

    return (
        <Container>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MasterBreadcrumbs
                    items={[
                        { title: "保険カテゴリー 一覧", href: "/admin/common/insurance-categories" },
                        { title: `詳細 (${item.name})` },
                    ]}
                    />

                <InsuranceCategoryDetail item={item} />
            </Stack>
        </Container>
    );
}
