import ClientPageMasterStaff from "./clientPage";

import { getMasterStaffs } from '@/lib/actions/common/masterStaff';
import { MasterStaffType } from '@/schemas/common/masterStaffSchema';

export default async function MasterStaff() {

    const res = await getMasterStaffs()
    const initial: MasterStaffType[] = res.data || []

    return (
        <ClientPageMasterStaff
            initial={initial}
            />
    );
}
