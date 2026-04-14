"use client";

import { Container, Paper, Typography, Stack } from "@mui/material";
import ApplyBreadcrumbs from "@/components/apply/parts/ApplyBreadcrumbs";

export default function ApplicationFormWrapper({
    applyName,
    formCode,
    children,
}: {
    applyName: string;
    formCode: string;
    children: React.ReactNode;
}) {
    return (
        <Container sx={{ px: 3 }} maxWidth="lg">
            <Stack spacing={2}>
                <ApplyBreadcrumbs
                    items={[
                        { title: applyName, href: `/apply/${formCode}` },
                        { title: "新規作成" },
                    ]}
                    />
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>{applyName}</Typography>
                        {children}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
