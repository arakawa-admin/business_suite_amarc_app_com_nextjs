import { Container, Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { InsuranceAgencyDetail } from "@/features/master/common/insurance-agencies/components/InsuranceAgencyDetail";
import { findInsuranceAgencyById } from "@/features/master/common/insurance-agencies/repositories/insuranceAgencyRepository";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PermitAgencyDetailPage({ params }: Props) {
    const { id } = await params;
    const item = await findInsuranceAgencyById(id);

    if (!item) {
        notFound();
    }

    return (
        <Container>
            <Stack spacing={2} sx={{ p: 2 }}>
                <MasterBreadcrumbs
                    items={[
                        { title: "保険契約先 一覧", href: "/admin/common/insurance-agencies" },
                        { title: `詳細 (${item.agencyName})` },
                    ]}
                    />

                <InsuranceAgencyDetail
                    item={item}
                    editHref={`/admin/common/insurance-agencies/${item.id}/edit`}
                />
            </Stack>
        </Container>
    );
}
