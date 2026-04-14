"use client";

import { Grid, Stack, Chip, Typography, Paper } from "@mui/material";

import { format } from "date-fns";
import { ChangeProfileInput } from "../zod";

export default function DependentsSectionReadOnly({
    value
}: {
    value: ChangeProfileInput["dependents"]
}) {
    return (
        <Stack spacing={2}>
            {value.map((dependent, index) => (
                <Grid key={index} size={12}>
                    <Paper sx={{ p: 2 }} variant="outlined">
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>扶養者 {index+1}</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }} variant="outlined">
                                        <Stack spacing={1}>
                                            <Chip
                                                color={dependent.is_add_dependent ? "success" : "error"}
                                                label={dependent.is_add_dependent ? "追加" : "削除"}
                                                size="small"
                                                sx={{ width: "fit-content" }}
                                                />
                                            <Typography variant="body2"><strong>氏名</strong> {dependent.name}( {dependent.kana} )</Typography>
                                            <Typography variant="body2"><strong>続柄</strong> {dependent.relation}</Typography>
                                            <Typography variant="body2"><strong>誕生日</strong> {format(dependent.birthday, "yyyy年MM月dd日")}</Typography>
                                            <Typography variant="body2"><strong>性別</strong> {dependent.gender}</Typography>
                                            <Typography variant="body2"><strong>居住</strong> {dependent.residence ? "同居" : "別居"}</Typography>
                                            <Typography variant="body2"><strong>住所</strong> 〒{dependent.zipcode?.slice(0, 3)}-{dependent.zipcode?.slice(3)} {dependent.address}</Typography>
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
