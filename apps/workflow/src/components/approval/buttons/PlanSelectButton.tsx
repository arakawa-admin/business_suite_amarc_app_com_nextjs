"use client";

import { Button, Stack, Typography, Chip } from "@mui/material";

import CreateIcon from '@mui/icons-material/Create';

export function PlanSelectButton() {
    return (
        <Button
            href="/approval/new"
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
                    <CreateIcon sx={{ fontSize: "2rem", mb: 2 }} />
                    <Typography
                        sx={{
                            fontWeight: "bold",
                            fontSize: "2rem",
                            lineHeight: "1",
                        }}
                        >
                        起案する
                    </Typography>
                </Stack>
            </Stack>
        </Button>
    );
}
