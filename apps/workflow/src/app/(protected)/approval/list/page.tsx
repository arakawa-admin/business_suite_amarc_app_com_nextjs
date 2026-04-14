import AprovalListPage from "./clientPage";

import { getApprovals } from '@/lib/actions/approval/approval';

export default async function ApprovalListPage() {
    const res = await getApprovals();
    const approvals = res.data;

    // TODO params 年別 ?year=2025 とかで取得する

    return (
        <AprovalListPage
            approvals={approvals}
            />
    );
}
