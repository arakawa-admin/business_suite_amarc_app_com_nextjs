import ClientPageMasterDepartment from "./clientPage";

import { getMasterDepartments } from '@/lib/actions/common/masterDepartment';
import { MasterDepartmentType } from '@/schemas/common/masterDepartmentSchema';

export default async function MasterDepartment() {

    const res = await getMasterDepartments()
    const initial: MasterDepartmentType[] = res.data || []

    return (
        <ClientPageMasterDepartment
            initial={initial}
            />
    );
}
