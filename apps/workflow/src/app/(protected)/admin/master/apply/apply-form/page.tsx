import ClientPage from "./clientPage";

import { getApplyForms } from '@/lib/actions/apply/applyForm';
import { ApplyFormType } from '@/schemas/apply/applyFormSchema';

export default async function MasterApplyForm() {

    const res = await getApplyForms()
    const initial: ApplyFormType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
