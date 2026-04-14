"use client";

import { Grid, Stack, Chip, Typography, Paper } from "@mui/material";

import { ChangeProfileInput } from "../zod";

export default function EmergencyContactsSectionReadOnly({
    value
}: {
    value: ChangeProfileInput["emergency_contacts"]
}) {
    return (
        <Stack spacing={2}>
            {value.map((contact, index) => (
                <Grid key={index} size={12}>
                    <Paper sx={{ p: 2 }} variant="outlined">
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>緊急連絡先 {index+1}</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }} variant="outlined">
                                        <Stack spacing={1}>
                                            <Chip label="変更前" size="small" />
                                            <Typography variant="body2"><strong>氏名:</strong> {contact.name_before}</Typography>
                                            <Typography variant="body2"><strong>電話番号:</strong> {contact.phone_before}</Typography>
                                            <Typography variant="body2"><strong>続柄:</strong> {contact.relation_before}</Typography>
                                        </Stack>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }} variant="outlined">
                                        <Stack spacing={1}>
                                            <Chip label="変更後" size="small" />
                                            <Typography variant="body2"><strong>氏名:</strong> {contact.name_after}</Typography>
                                            <Typography variant="body2"><strong>電話番号:</strong> {contact.phone_after}</Typography>
                                            <Typography variant="body2"><strong>続柄:</strong> {contact.relation_after}</Typography>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Paper>
                </Grid>
            ))}
        </Stack>
    );
}
