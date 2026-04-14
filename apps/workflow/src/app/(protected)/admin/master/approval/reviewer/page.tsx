import ClientPage from "./clientPage";

import { getMasterDepartmentReviewers } from '@/lib/actions/approval/masterDepartmentReviewer';
import { MasterDepartmentReviewerType } from '@/schemas/approval/masterDepartmentReviewerSchema';

export default async function MasterApprovalReviewer() {

    const res = await getMasterDepartmentReviewers()
    const initial: MasterDepartmentReviewerType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
