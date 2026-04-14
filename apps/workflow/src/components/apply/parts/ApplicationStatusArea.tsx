"use client";

import { Alert, AlertColor, Icon, Typography } from "@mui/material";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { ApplicationWithRevisionsType } from "@/schemas/apply/applicationSchema";

const STATUS_SEVERITY_MAP: Record<string, AlertColor> = {
    pending: "info",
    approved: "success",
    rejected: "error",
    cancelled: "error",
    return: "warning",
} as const;

export default function ApplicationStatusArea({
    application,
}: {
    application: ApplicationWithRevisionsType
}) {
    const severity = STATUS_SEVERITY_MAP[application.status.code] || "info";

    return (
        <Alert
            severity={severity}
            sx={{
                borderRadius: 1,
                fontWeight: "bold",
                my: 2,
                '.MuiAlert-icon': { fontSize: "2em", pt: 2 },
            }}
            >
            <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "2em" }}>
                {application.status.name} {application.completed_at && `(${format(application.completed_at, "yyyy-MM-dd HH:mm", { locale: ja })})`}
            </Typography>
        </Alert>
    );
}
