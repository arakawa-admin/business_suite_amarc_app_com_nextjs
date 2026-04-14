import ClientPage from "./clientPage";

// TODO fetch plan by department
import { getApprovalById } from '@/lib/actions/approval/approval';

type Props = {
    params: Promise<{
        id: string
    }>;
};
export default async function ApprovalDetailPage({ params }: Props) {
    const { id } = await params;
    const res = await getApprovalById(id);
    const approval = res.data;

    return (
        <ClientPage
            approval={approval}
            />
    );
}
