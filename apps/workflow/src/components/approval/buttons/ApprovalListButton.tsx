"use client";

import { Button, Stack, Typography, Chip } from "@mui/material";

import ChecklistIcon from '@mui/icons-material/Checklist';

export function ApprovalListButton() {
    return (
        <Button
            href="/approval/list"
            variant="contained"
            className="bg-gradient-to-br from-success-dark via-success-main via-40% to-success-light to-90%"
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
                    label="稟議書"
                    color="success"
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
                        一覧を見る
                    </Typography>
                </Stack>
            </Stack>
        </Button>
    );
}
