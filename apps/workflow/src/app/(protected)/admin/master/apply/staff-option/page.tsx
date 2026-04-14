import ClientPage from "./clientPage";

import { getMasterStaffOptions } from '@/lib/actions/apply/masterStaffOption';
import { MasterStaffOptionType } from '@/schemas/apply/masterStaffOptionSchema';

export default async function MasterApplyApprover() {

    const res = await getMasterStaffOptions()
    const initial: MasterStaffOptionType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
