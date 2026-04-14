import ClientPage from "./clientPage";

import { getMasterDepartmentApprovers } from '@/lib/actions/approval/masterDepartmentApprover';
import { MasterDepartmentApproverType } from '@/schemas/approval/masterDepartmentApproverSchema';

export default async function MasterApprovalApprover() {

    const res = await getMasterDepartmentApprovers()
    const initial: MasterDepartmentApproverType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
