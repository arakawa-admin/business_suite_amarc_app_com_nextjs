import ClientPage from "./clientPage";

import { getMasterFormViewers } from '@/lib/actions/apply/masterFormViewer';
import { MasterFormViewerType } from '@/schemas/apply/masterFormViewerSchema';

export default async function MasterApplyViewer() {

    const res = await getMasterFormViewers()
    const initial: MasterFormViewerType[] = res.data || []

    return (
        <ClientPage
            initial={initial}
            />
    );
}
