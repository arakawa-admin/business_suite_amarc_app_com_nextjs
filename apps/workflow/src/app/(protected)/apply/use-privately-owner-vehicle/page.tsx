import ApplicationDashboard from "@/components/apply/parts/ApplicationDashboard";

import { getApplyFormByCode } from '@/lib/actions/apply/applyForm';
import { getApplicationsByFormId } from '@/lib/actions/apply/application';

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { generateDateStringFromAndTo } from "@/lib/generateDateString";

type searchType= {
    date?: string;
}
export default async function ApplyFormListPage({
    searchParams,
}: {
    searchParams: Promise<searchType>
}) {
    const APPLY_TYPE = "use-privately-owner-vehicle";
    const { data: applyForm } = await getApplyFormByCode(APPLY_TYPE);
    if(!applyForm) return null;

    const { date } = await searchParams;
    const dateString = (date === undefined) ? format(new Date(), "yyyy-MM", { locale: ja }) : date;
    const { from: fromString, to: toString } = generateDateStringFromAndTo(dateString);
    const { data: applications } = await getApplicationsByFormId(applyForm.id, {from: fromString, to:toString});

    return (
        <ApplicationDashboard
            applications={applications ?? []}
            applyName="個人所有車使用許可申請"
            applyType={APPLY_TYPE}
            />
    );
}
