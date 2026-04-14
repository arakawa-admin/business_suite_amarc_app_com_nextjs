import ClientPage from "./clientPage";

import { getApplyFormCategorys } from '@/lib/actions/apply/applyFormCategory';
import { ApplyFormCategoryType } from '@/schemas/apply/applyFormCategorySchema';

export default async function MasterApplyFormCagegory() {

    const res = await getApplyFormCategorys()
    const initial: ApplyFormCategoryType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
