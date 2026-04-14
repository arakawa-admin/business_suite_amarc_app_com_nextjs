"use client";

import { Button, Stack, Typography, Chip } from "@mui/material";

import CreateIcon from '@mui/icons-material/Create';

export function PlanCreateButton() {
    return (
        <Button
            // href="/approval/plan/new?dept=xx"
            variant="contained"
            className="bg-gradient-to-br from-info-dark via-info-main via-40% to-info-light to-90%"
            size="large"
            sx={{
                py: 2,
                width: "100%",
                minHeight: "10rem",
                borderRadius: 6,
            }}
            >
            <Stack alignItems={"center"}>
                <Chip
                    label="設備投資計画"
                    color="info"
                    variant="outlined"
                    size="small"
                    sx={{
                        backgroundColor: "white",
                        mb: 1,
                        fontWeight: "bold",
                    }} />
                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                    <CreateIcon sx={{ fontSize: "2rem", mb: 2 }} />
                    <Typography
                        sx={{
                            fontWeight: "bold",
                            fontSize: "2rem",
                            lineHeight: "1",
                        }}
                        >
                        追加する
                    </Typography>
                </Stack>
            </Stack>
        </Button>
    );
}
