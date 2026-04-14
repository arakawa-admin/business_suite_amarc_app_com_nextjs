"use client";
import { useRouter } from "next/navigation";
import {
    Box,
    Container,
    Paper,
    Typography,
    Chip,
    Stack,
    Alert,
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from "@mui/material";
import { grey } from '@mui/material/colors';

import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { toast } from "react-toastify";

import { ApprovalWithRelationsType } from "@/schemas/approval/approvalSchema";
import { AttachmentType } from "@/schemas/approval/attachmentSchema";

import ApprovalBreadcrumbs from "@/components/approval/parts/ApprovalBreadcrumbs";
import DetailSection from "@/components/approval/parts/DetailSection";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import ApproveOrderSection from "@/components/approval/parts/ApproveOrderSection";
import ApproveReviewSection from "@/components/approval/parts/ApproveReviewSection";

import UploadedFileList from "@ui/form/file/UploadedFileList";

export default function ClientPageDetail({
    approval,
}: {
    approval: ApprovalWithRelationsType | undefined
}) {
    const router = useRouter();

    if(!approval) {
        toast.error("稟議書が存在しません。ダッシュボードに戻ります。");
        router.push("/approval");
        return null;
    }

    const data = [
        {
            title: "起案者",
            value: (
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <Typography sx={{ fontWeight: "bold" }}>{ approval.author.name } <Chip label={approval.department.name} size="small" sx={{ ml: 1 }} component={'span'} /></Typography>
                </Stack>
            )
        },
        {
            title: "タイトル",
            value:
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <Typography sx={{ fontWeight: "bold" }}>{ approval.title }</Typography>
                </Stack>
        },
        {
            title: "本件予算",
            value: approval.approval_revisions &&
                <Stack spacing={2}>
                    {approval.approval_revisions.map((r, i, arr) => {
                        if(!r.budget) return null;
                        const prev = arr[i - 1];

                        const curr = r.budget;
                        const prevVal = prev?.budget;

                        const shouldShow = curr !== null && curr !== prevVal;

                        if (!shouldShow) return null;
                        return (
                            <Stack key={r.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }} direction={"row"} spacing={1} alignItems={"center"}>
                                <Typography>¥ { r.budget.toLocaleString() }</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", }}>
                                    { format(r.snapshot_at, "yyyy/MM/dd HH:mm", { locale: ja }) } 投稿
                                </Typography>
                                {i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                            </Stack>
                        )
                    })}
                </Stack>
        },
        {
            title: "本文",
            value: approval.approval_revisions &&
                <Stack spacing={2}>
                    {approval.approval_revisions.map((r, i, arr) => {
                        if(!r.details) return null;
                        const prev = arr[i - 1];

                        const curr = r.details;
                        const prevVal = prev?.details;

                        const shouldShow = curr !== null && curr !== prevVal;

                        if (!shouldShow) return null;
                        return (
                            <Stack key={r.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }} spacing={1}>
                                <Box sx={{ whiteSpace: "pre-wrap" }}>{ r.details }</Box>
                                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", }}>
                                        { format(r.snapshot_at, "yyyy/MM/dd HH:mm", { locale: ja }) } 投稿
                                    </Typography>
                                    {i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                                </Stack>
                            </Stack>
                        )
                    })}
                </Stack>
        },
        {
            title: "償却期間",
            value: approval.approval_revisions &&
                <Stack spacing={2}>
                    {approval.approval_revisions.map((r, i, arr) => {
                        if(!r.depreciation_period_months) return null;
                        const prev = arr[i - 1];

                        const curr = r.depreciation_period_months;
                        const prevVal = prev?.depreciation_period_months;

                        const shouldShow = curr !== null && curr !== prevVal;

                        if (!shouldShow) return null;
                        return (
                            <Stack key={r.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }} direction={"row"} spacing={1} alignItems={"center"}>
                                <Typography>{ r.depreciation_period_months } 年</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", }}>
                                    { format(r.snapshot_at, "yyyy/MM/dd HH:mm", { locale: ja }) } 投稿
                                </Typography>
                                {i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                            </Stack>
                        )
                    })}
                </Stack>
        },
        {
            title: "償却額",
            value: approval.approval_revisions &&
                <Stack spacing={2}>
                    {approval.approval_revisions.map((r, i, arr) => {
                        if(!r.depreciation_amount) return null;
                        const prev = arr[i - 1];

                        const curr = r.depreciation_amount;
                        const prevVal = prev?.depreciation_amount;

                        const shouldShow = curr !== null && curr !== prevVal;

                        if (!shouldShow) return null;
                        return (
                            <Stack key={r.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }} direction={"row"} spacing={1} alignItems={"center"}>
                                <Typography>¥ { r.depreciation_amount.toLocaleString() } / 月</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", }}>
                                    { format(r.snapshot_at, "yyyy/MM/dd HH:mm", { locale: ja }) } 投稿
                                </Typography>
                                {i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                            </Stack>
                        )
                    })}
                </Stack>
        },
        {
            title: "実施期間",
            value: approval.approval_revisions &&
                <Stack spacing={2}>
                    {approval.approval_revisions.map((r, i, arr) => {
                        if(!r.start_date || !r.end_date) return null;
                        const prev = arr[i - 1];

                        const currSt = r.start_date ? new Date(r.start_date).getTime() : null;
                        const prevValSt = prev?.start_date ? new Date(prev.start_date).getTime() : null;
                        const currEd = r.end_date ? new Date(r.end_date).getTime() : null;
                        const prevValEd = prev?.end_date ? new Date(prev.end_date).getTime() : null;

                        const shouldShow = currSt !== null && currSt !== prevValSt && currEd !== null && currEd !== prevValEd;

                        if (!shouldShow) return null;
                        return (
                            <Stack key={r.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }} direction={"row"} spacing={1} alignItems={"center"}>
                                <Typography>{ format(r.start_date, "yyyy/MM/dd", { locale: ja }) }~ { format(r.end_date, "yyyy/MM/dd", { locale: ja }) }</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", }}>
                                    { format(r.snapshot_at, "yyyy/MM/dd HH:mm", { locale: ja }) } 投稿
                                </Typography>
                                {i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                            </Stack>
                        )
                    })}
                </Stack>
        },
        {
            title: "請求予定月",
            value: approval.approval_revisions &&
                <Stack spacing={2}>
                    {approval.approval_revisions.map((r, i, arr) => {
                        if(!r.billing_date) return null;
                        const prev = arr[i - 1];

                        const curr = r.billing_date ? new Date(r.billing_date).getTime() : null;
                        const prevVal = prev?.billing_date ? new Date(prev.billing_date).getTime() : null;

                        const shouldShow = curr !== null && curr !== prevVal;

                        if (!shouldShow) return null;
                        return (
                            <Stack key={r.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }} direction={"row"} spacing={1} alignItems={"center"}>
                                <Typography>{ format(r.billing_date, "yyyy/MM", { locale: ja }) }</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", }}>
                                    { format(r.snapshot_at, "yyyy/MM/dd HH:mm", { locale: ja }) } 投稿
                                </Typography>
                                {i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                            </Stack>
                        )
                    })}
                </Stack>
        },
        {
            title: "支払予定月",
            value: approval.approval_revisions &&
                <Stack spacing={2}>
                    {approval.approval_revisions.map((r, i, arr) => {
                        if(!r.payment_date) return null;
                        const prev = arr[i - 1];

                        const curr = r.payment_date ? new Date(r.payment_date).getTime() : null;
                        const prevVal = prev?.payment_date ? new Date(prev.payment_date).getTime() : null;

                        const shouldShow = curr !== null && curr !== prevVal;

                        if (!shouldShow) return null;
                        return (
                            <Stack key={r.id} sx={{ borderBottom: 1, borderColor: "divider", pb: 0.5 }} direction={"row"} spacing={1} alignItems={"center"}>
                                <Typography>{ format(r.payment_date, "yyyy/MM", { locale: ja }) }</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", }}>
                                    { format(r.snapshot_at, "yyyy/MM/dd HH:mm", { locale: ja }) } 投稿
                                </Typography>
                                {i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                            </Stack>
                        )
                    })}
                </Stack>
        },
        {
            title: "添付ファイル",
            value: approval.approval_revisions &&
                <Stack spacing={1}>
                    {approval.approval_revisions?.map((r, i) => {
                        const attachments = (r.attachments ?? [])
                            .map((x) => x.attachment)
                            .filter((x): x is AttachmentType => x != null);

                        if (attachments.length === 0) return null;
                        return (
                            <UploadedFileList
                                key={r.id}
                                attachments={attachments}
                                subtitle={i!==0 && <Chip label={`改訂${r.round}版`} color="warning" variant="outlined" size="small" />}
                                fetchUrl={"/api/approval/attachments/signed-urls"}
                                onRemove={() => {}}
                                />
                        )
                    })}
                </Stack>
        },
    ]

    return (
        <Box sx={{ backgroundColor: grey[100], minHeight: "100vh" }}>
            <Container
                sx={{ p: 3, mb: 6 }}
                maxWidth="lg"
                >
                <ApprovalBreadcrumbs
                    items={[
                        { title: "稟議書一覧", href: `/approval/list` },
                        { title: approval.title }
                    ]}
                    />

                <Typography variant="body2" sx={{ color: "text.secondary", p: 1 }}>
                    稟議書 {approval.serial_no}
                </Typography>

                <Stack spacing={1} sx={{ py: 2 }}>
                    <Alert sx={{ backgroundColor: approval.status.color }} variant="filled">{approval.status.name}</Alert>
                </Stack>

                <Stack spacing={1} sx={{ py: 2 }}>
                    <Stack direction={"row"} spacing={1} sx={{ py: 2 }} alignItems={"center"}>
                        <Chip label={`No. ${approval.serial_no}`} size="small" />
                        <Chip label={`起案日: ${format(approval.submitted_at, "yyyy/MM/dd", { locale: ja })}`} size="small" />
                        <Chip label={`起案部門: ${approval.department_name_snapshot}`} size="small" />
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: "bold", px: 1 }}>{approval.title}</Typography>
                </Stack>

                <Stack spacing={1} sx={{ py: 2 }}>
                    {/* 決裁エリア */}
                    <Accordion
                        defaultExpanded
                        sx={{ width: "100%" }}
                        >
                        <AccordionSummary
                            expandIcon={
                                <ArrowDropDownIcon
                                    sx={{ color: "success.contrastText" }}
                                />}
                            className={`bg-gradient-to-b from-success-dark via-success-main to-success-light`}
                            sx={{
                                color: "success.contrastText",
                                fontWeight: "bold",
                                minHeight: "48px!important",
                            }}
                            >
                            決裁エリア
                        </AccordionSummary>
                        <AccordionDetails sx={{ border: "1px solid", borderColor: "divider" }}>
                            <Stack spacing={3} sx={{ py: 2 }}>
                                <ApproveOrderSection approval={approval} />
                                <ApproveReviewSection approval={approval} />
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* 稟議書エリア */}
                    <Accordion
                        defaultExpanded
                        sx={{ width: "100%" }}
                        >
                        <AccordionSummary
                            expandIcon={
                                <ArrowDropDownIcon
                                    sx={{ color: "success.contrastText" }}
                                />}
                            className={`bg-gradient-to-b from-success-dark via-success-main to-success-light`}
                            sx={{
                                color: "success.contrastText",
                                fontWeight: "bold",
                                minHeight: "48px!important",
                            }}
                            >
                            稟議書
                        </AccordionSummary>
                        <AccordionDetails sx={{ border: "1px solid", borderColor: "divider" }}>
                            <Paper
                                sx={{ p: 2 }}
                                >
                                {data.map((d, i) => (
                                    d.value && <DetailSection key={i} title={d.title} value={d.value} />
                                ))}
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
                </Stack>
            </Container>
        </Box>
    )
}

