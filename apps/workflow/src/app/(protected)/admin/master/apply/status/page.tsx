import ClientPage from "./clientPage";

import { getMasterStatus } from '@/lib/actions/apply/masterStatus';
import { MasterStatusType } from '@/schemas/apply/masterStatusSchema';

export default async function MasterStaff() {

    const res = await getMasterStatus()
    const initial: MasterStatusType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
