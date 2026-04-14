import ClientPage from "./clientPage";

import { getMasterStatus } from '@/lib/actions/approval/masterStatus';
import { MasterStatusType } from '@/schemas/approval/masterStatusSchema';

export default async function MasterStaff() {

    const res = await getMasterStatus()
    const initial: MasterStatusType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
