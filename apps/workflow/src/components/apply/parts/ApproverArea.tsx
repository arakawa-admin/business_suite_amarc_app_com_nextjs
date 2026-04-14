"use client";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Stack,
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { ApplicationWithRevisionsType } from "@/schemas/apply/applicationSchema";
import ApprovalOrderSection from "@/components/apply/parts/ApprovalOrderSection";
import ApplicationStatusArea from "@/components/apply/parts/ApplicationStatusArea";

export default function ApproverArea({
    application,
}: {
    application: ApplicationWithRevisionsType
}) {
    return (
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
                        <ApplicationStatusArea application={application} />
                        <ApprovalOrderSection application={application} />
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Stack>
    );
}
