import { getApplyForms } from "@/lib/actions/apply/applyForm";

import ClientPage from "./clientPage";

export default async function ApplyFormListPage() {
    const { data: forms } = await getApplyForms();
    if(forms === undefined) return <></>;

    return (
        <ClientPage
            forms={forms}
            />
    );
}
