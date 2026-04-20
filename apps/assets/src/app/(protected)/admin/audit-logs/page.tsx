import { Container, Stack, Typography } from "@mui/material";
import { findAuditLogs } from "@/features/audit/repositories/auditLogRepository";
import { AuditLogDataGrid } from "@/features/audit/components/AuditLogDataGrid";
import MasterBreadcrumbs from "@/components/common/layout/MasterBreadcrumbs";

export default async function AuditLogsPage() {
    const rows = await findAuditLogs();

    return (
        <Container maxWidth="xl">

            <MasterBreadcrumbs
                items={[
                    { title: "監査ログ" },
                ]}
                />

            <Stack spacing={3} sx={{ py: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    監査ログ
                </Typography>

                <AuditLogDataGrid rows={rows} />
            </Stack>
        </Container>
    );
}
