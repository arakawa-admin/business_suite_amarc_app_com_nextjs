"use client";

import React from "react";
import Link from "next/link";

import {
    Box,
    Container,
    Grid,
    Button,
    Typography,
    Stack,
    Paper,
} from "@mui/material";

import GroupIcon from '@mui/icons-material/Group';

type Masters = {
        category: string,
        color: "primary" | "secondary" | "success" | "error" | "info" | "warning",
        items: {
            title: string,
            route: string,
            icon: any
        }[]
}
export default function ClientPageForAdmin() {
    const masters: Masters[]
    = [
        {
            category: "許認可",
            color: "success",
            items: [
                {
                    title: "許認可カテゴリー",
                    route: "permit/permit-categories",
                    icon: <GroupIcon />
                },
            ]
        },
        {
            category: "車両",
            color: "primary",
            items: [
                {
                    title: "車両保険カテゴリー",
                    route: "vehicle/vehicle-insurance-categories",
                    icon: <GroupIcon />
                },
                {
                    title: "車両保険契約先",
                    route: "vehicle/vehicle-insurance-agencies",
                    icon: <GroupIcon />
                },
            ]
        },
    ]
    return (
        <Container
            sx={{ p: 3 }}
            maxWidth="xl"
            >
            <Stack spacing={2}>
                {masters.map((master, idx) => (
                    <Box key={idx}>
                        <Typography color="text.secondary" sx={{ p: 1 }}>
                            {master.category}
                        </Typography>
                        <Paper sx={{ p: 2 }} variant="outlined">
                            <Grid container spacing={2}>
                                {master.items.map((item) => (
                                    <Grid
                                        key={item.route}
                                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                        >
                                        <Link
                                            href={`/admin/${item.route}`}
                                            passHref
                                            >
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                color={master.color?? "primary"}
                                                size="large"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontSize: '1.2em',
                                                    p: 2,
                                                    minHeight: '80px',
                                                    borderRadius: '20px',
                                                }}
                                                startIcon={React.cloneElement(item.icon, {
                                                    sx: {
                                                        fontSize: "1.5em!important",
                                                        color: "#fff",
                                                        mr: 1.5,
                                                    },
                                                })}
                                                >
                                                {item.title} マスタ
                                            </Button>
                                        </Link>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Box>
                ))}
                <Box>
                    <Typography color="text.secondary" sx={{ p: 1 }}>
                        ログ
                    </Typography>
                    <Paper sx={{ p: 2 }} variant="outlined">
                        <Grid container spacing={2}>
                            <Grid
                                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                >
                                <Link
                                    href={`/admin/audit-logs`}
                                    passHref
                                    >
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        color={"inherit"}
                                        size="large"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '1.2em',
                                            p: 2,
                                            minHeight: '80px',
                                            borderRadius: '20px',
                                        }}
                                        >
                                        監査ログ
                                    </Button>
                                </Link>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </Stack>
        </Container>
    );
}
