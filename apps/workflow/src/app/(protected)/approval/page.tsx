// import { getApprovals } from "@/lib/actions/approval";
// import { ApprovalWithRelationsType } from "@/schemas/approval/approvalSchema";

import ClientPage from "./clientPage";

// import { format, startOfMonth, endOfMonth } from "date-fns";
// import { ja } from "date-fns/locale";

// type searchType= {
//     title?: string;
//     customer?: string;
//     author?: string;
//     from?: string;
//     to?: string
// }

export default async function ApprovalListPage() {
// export default async function ApprovalListPage({
//     searchParams,
// }: {
//     searchParams: Promise<searchType>
// }) {
    // const params: searchType = await searchParams;

    // const approvals: ApprovalWithRelationsType[] = await getApprovals({
    //                                         ...params,
    //                                         from : params.from ?? format(startOfMonth(new Date()), "yyyy-MM-dd", { locale: ja }),
    //                                         to : params.to ?? format(endOfMonth(new Date()), "yyyy-MM-dd", { locale: ja }),
    //                                     });
    return (
        <ClientPage
            // approvals={approvals}
            />
    );
}
