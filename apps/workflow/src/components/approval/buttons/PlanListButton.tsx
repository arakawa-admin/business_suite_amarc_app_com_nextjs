"use client";

import { Button, Stack, Typography, Chip } from "@mui/material";

import ChecklistIcon from '@mui/icons-material/Checklist';

export function PlanListButton() {
    return (
        <Button
            // href="/approval/plan/list"
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
                    <ChecklistIcon sx={{ fontSize: "2rem", mb: 2 }} />
                    <Typography
                        sx={{
                            fontWeight: "bold",
                            fontSize: "2rem",
                            lineHeight: "1",
                        }}
                        >
                        一覧をみる
                    </Typography>
                </Stack>
            </Stack>
        </Button>
    );
}
