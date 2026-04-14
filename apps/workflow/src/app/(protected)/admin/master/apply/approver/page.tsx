import ClientPage from "./clientPage";

import { getMasterFormApprovers } from '@/lib/actions/apply/masterFormApprover';
import { MasterFormApproverType } from '@/schemas/apply/masterFormApproverSchema';

export default async function MasterApplyApprover() {

    const res = await getMasterFormApprovers()
    const initial: MasterFormApproverType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
