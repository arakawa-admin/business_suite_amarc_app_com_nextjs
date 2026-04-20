import { findPermitList } from "@/features/permits/repositories/permitRepository";
import { PermitList } from "@/features/permits/components/permitList";

import { findPermitCategoryList } from "@/features/master/permit/permit-categories/repositories/permitCategoryRepository";

type Props = {
    searchParams: Promise<{
        q?: string;
        categoryId?: string;
        status?: "unknown" | "expired" | "alert_due" | "active";
    }>;
};

export default async function PermitListPage({ searchParams }: Props) {
    const params = await searchParams;

    const rows = await findPermitList({
        q: params.q,
        categoryId: params.categoryId,
        status: params.status,
    });

    const categoryList = await findPermitCategoryList()
    const categoryOptions = categoryList.map((c) => ({id: c.id, name: c.name}))

    return <PermitList rows={rows} categoryOptions={categoryOptions} />;
}
