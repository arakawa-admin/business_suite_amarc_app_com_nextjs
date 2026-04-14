"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveSystem } from "@/contexts/ActiveSystemContext";
import { Stack, Box,
    // Paper, Grid
} from "@mui/material";

// import { InquiryWithRelationsType } from "@/schemas/inquirySchema";

// import InquiryDataGridWrapper from "@/components/ui/InquiryDataGridWrapper";
// import InquiryProgressDataGridWrapper from "@/components/ui/InquiryProgressDataGridWrapper";
// import InquiryArrangementDataGridWrapper from "@/components/ui/InquiryArrangementDataGridWrapper";
// import InquiryResultDataGridWrapper from "@/components/ui/InquiryResultDataGridWrapper";
// import InquiryCompletedDataGridWrapper from "@/components/ui/InquiryCompletedDataGridWrapper";

// import SelectAnyDate from "@/components/common/parts/SelectAnyDate";

// import StatCardNotStartedCount from "@/components/widgets/StatCardNotStartedCount";
// import StatCardInquiryCount from "@/components/widgets/StatCardInquiryCount";
// import PieChartInquiryByDepartments from "@/components/widgets/PieChartInquiryByDepartments";
// import StatCardInquiryProgressCount from "@/components/widgets/StatCardInquiryProgressCount";
// import StatCardContractedRate from "@/components/widgets/StatCardContractedRate";
// import StatCardCompletedRate from "@/components/widgets/StatCardCompletedRate";

export default function ClientPageDashboard() {
//     inquirys,
//     inquiryProgress,
//     inquiryInvalidProgress,
//     inquiryArrangements,
//     inquiryResults,
//     completedInquirys,
// }: {
//     inquirys: InquiryWithRelationsType[];
//     inquiryProgress: InquiryWithRelationsType[];
//     inquiryInvalidProgress: InquiryWithRelationsType[];
//     inquiryArrangements: InquiryWithRelationsType[];
//     inquiryResults: InquiryWithRelationsType[];
//     completedInquirys: InquiryWithRelationsType[];
// }) {
    const router = useRouter();
    // const params = useSearchParams();

    const { activeSystem } = useActiveSystem()

    useEffect(() => {
        if(!!activeSystem){
            router.push(`/${activeSystem}`);
            return
        }
    }, [router, activeSystem]);

    // const [selectDate, setSelectDate] = useState(new Date());

    // ▼--- クエリから初期日付をセットする処理 ---▼
    // useEffect(() => {
    //     const raw = params.get("date");
    //     if (!raw) return;

    //     let d: Date | null = null;

    //     if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    //         // YYYY-MM-DD
    //         d = new Date(raw);
    //     } else if (/^\d{4}-\d{2}$/.test(raw)) {
    //         // YYYY-MM
    //         d = new Date(raw + "-01T00:00:00");
    //     } else if (/^\d{4}$/.test(raw)) {
    //         // YYYY
    //         d = new Date(raw + "-01-01T00:00:00");
    //     }
    //     if (d && !isNaN(d.getTime())) {
    //         setSelectDate(d);
    //     }
    // }, [params]);

    // const onMonthChange = (d: Date) => {
    //     const query = new URLSearchParams(params);

    //     const year = d.getFullYear();
    //     const month = String(d.getMonth() + 1).padStart(2, "0");
    //     query.set("date", `${year}-${month}`);

    //     router.push(`?${query.toString()}`);
    // };

    // const totaInquirys = [
    //     ...inquirys,
    //     ...inquiryProgress,
    //     ...inquiryInvalidProgress,
    //     ...inquiryArrangements,
    //     ...inquiryResults,
    //     ...completedInquirys
    // ]
    // const totaInquirysCount = totaInquirys.length;

    return (
        <Box sx={{ my: 1 }}>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 1
                }}
                >
                <Box sx={{ px: 2 }} className="text-gray-500">
                    ダッシュボード
                </Box>
                {/* <SelectAnyDate
                    mode="month"
                    value={selectDate}
                    minDate={new Date('2026-01-01')}
                    maxDate={new Date()}
                    onChange={(v) => v && onMonthChange(v)}
                    /> */}
            </Stack>

            {/* <Grid container>
                <Grid size={{ lg: 2 }} order={{ xs: 2, lg: 1 }} sx={{ width: "100%" }}>
                    <Grid container spacing={0}>
                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardInquiryCount
                                inquirys={totaInquirys}
                                />
                        </Grid>

                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <PieChartInquiryByDepartments
                                inquirys={totaInquirys}
                                />
                        </Grid>

                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardNotStartedCount
                                inquirys={inquirys}
                                />
                        </Grid>

                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardInquiryProgressCount
                                inquirys={totaInquirys}
                                status="inspection"
                                isRemain
                                />
                        </Grid>
                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardInquiryProgressCount
                                inquirys={totaInquirys}
                                status="quotation"
                                isRemain
                                />
                        </Grid>

                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardInquiryProgressCount
                                inquirys={totaInquirys}
                                status="contracted"
                                isRemain
                                />
                        </Grid>

                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardInquiryProgressCount
                                inquirys={inquiryInvalidProgress}
                                status="invalid"
                                />
                        </Grid>

                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardContractedRate
                                numerator={totaInquirys.filter((inq) => inq.progress?.some((p) => (p.status.code === "contracted"))).length}
                                denominator={totaInquirysCount}
                                />
                        </Grid>

                        <Grid size={{ xs: 6, lg: 12 }} sx={{ p: 1 }}>
                            <StatCardCompletedRate
                                numerator={totaInquirys.filter((inq) => inq.finished_at!=null).length}
                                denominator={totaInquirysCount}
                                />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid size={{ lg: 10 }} order={{ xs: 1, lg: 2 }} sx={{ width: "100%" }}>
                    <Stack spacing={2} sx={{ p: 1 }}>
                        <Paper variant="outlined">
                            <InquiryDataGridWrapper
                                inquirys={inquirys}
                                totaInquirys={totaInquirys}
                                />
                        </Paper>
                        <Paper variant="outlined">
                            <InquiryProgressDataGridWrapper
                                inquirys={inquiryProgress}
                                // totaInquirys={totaInquirys}
                                />
                        </Paper>
                        <Paper variant="outlined">
                            <InquiryArrangementDataGridWrapper
                                inquirys={inquiryArrangements}
                                />
                        </Paper>
                        <Paper variant="outlined">
                            <InquiryResultDataGridWrapper
                                inquirys={inquiryResults}
                                />
                        </Paper>
                        <Paper variant="outlined">
                            <InquiryCompletedDataGridWrapper
                                inquirys={completedInquirys}
                                />
                        </Paper>
                    </Stack>
                </Grid>
            </Grid> */}
        </Box>
    )
}

