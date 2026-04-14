// import { InquiryWithRelationsType } from "@/schemas/inquirySchema";

// import {
//     getInquirys,
//     getInquirysProgressStep,
//     getInquirysArrangementStep,
//     getInquirysResultStep,
// } from "@/lib/actions/inquiry";

import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { generateDateStringFromAndTo } from "@/lib/generateDateString";
import ClientPage from "./clientPage";

type searchType= {
    date?: string;
}
export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<searchType>
}) {
    const { date } = await searchParams;

    const dateString = (date === undefined) ? format(new Date(), "yyyy-MM", { locale: ja }) : date;
    const { from: fromString, to: toString } = generateDateStringFromAndTo(dateString);

    // const inquirys: InquiryWithRelationsType[] = await getInquirys({from: fromString, to:toString});
    // const inquiryProgress: InquiryWithRelationsType[] = await getInquirysProgressStep({from: fromString, to:toString});
    // const inquiryValidProgress: InquiryWithRelationsType[] = inquiryProgress.filter((inquiry) => inquiry.progress?.every((p) => (["inspection", "quotation"].includes(p.status.code))));
    // const inquiryInvalidProgress: InquiryWithRelationsType[] = inquiryProgress.filter((inquiry) => inquiry.progress?.some((p) => (p.status.code === "invalid")));
    // const inquiryArrangements: InquiryWithRelationsType[] = inquiryProgress.filter((inquiry) => inquiry.progress?.some((p) => (p.status.code === "contracted")));
    // const inquiryResults: InquiryWithRelationsType[] = await getInquirysArrangementStep({from: fromString, to:toString});
    // const completedInquirys: InquiryWithRelationsType[] = await getInquirysResultStep({from: fromString, to:toString});

    return (
        <ClientPage
            // inquirys={inquirys}
            // inquiryProgress={inquiryValidProgress}
            // inquiryInvalidProgress={inquiryInvalidProgress}
            // // inquiryProgress={inquiryProgress.filter((inquiry) => inquiry.progress?.every((p) => (p.status.code !== "invalid"))) }
            // inquiryArrangements={inquiryArrangements}
            // inquiryResults={inquiryResults}
            // completedInquirys={completedInquirys}
            />
    );
}
