import ClientPageMasterCompany from "./clientPage";

import { getMasterCompanys } from '@/lib/actions/common/masterCompany';
import { MasterCompanyType } from '@/schemas/common/masterCompanySchema';

export default async function MasterCompany() {

    const res = await getMasterCompanys()
    const initial: MasterCompanyType[] = res.data || []

    return (
        <ClientPageMasterCompany
            initial={initial}
            />
    );
}
