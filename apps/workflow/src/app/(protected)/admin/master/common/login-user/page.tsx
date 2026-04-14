import ClientPageMasterLoginUser from "./clientPage";

import { getMasterLoginUsers } from '@/lib/actions/common/masterLoginUser';
import { MasterLoginUserType } from '@/schemas/common/masterLoginUserSchema';

export default async function MasterLoginUser() {

    const res = await getMasterLoginUsers()
    const initial: MasterLoginUserType[] = res.data || []

    return (
        <ClientPageMasterLoginUser
            initial={initial}
            />
    );
}
