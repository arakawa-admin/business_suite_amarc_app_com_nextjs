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

import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ApartmentIcon from '@mui/icons-material/Apartment';
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
            category: "共通マスタ",
            color: "primary",
            items: [
                {
                    title: "ログインユーザー",
                    route: "common/login-user",
                    icon: <PersonIcon />
                },
                {
                    title: "スタッフ",
                    route: "common/staff",
                    icon: <AccountCircleIcon />
                },
                {
                    title: "会社",
                    route: "common/company",
                    icon: <BusinessIcon />
                },
                {
                    title: "部門",
                    route: "common/department",
                    icon: <ApartmentIcon />
                },
            ]
        },
        {
            category: "稟議書システムマスタ",
            color: "success",
            items: [
                {
                    title: "稟議ステータス",
                    route: "approval/status",
                    icon: <GroupIcon />
                },
                {
                    title: "承認者",
                    route: "approval/approver",
                    icon: <GroupIcon />
                },
                {
                    title: "回議者",
                    route: "approval/reviewer",
                    icon: <GroupIcon />
                },
            ]
        },
        {
            category: "申請書システムマスタ",
            color: "warning",
            items: [
                {
                    title: "スタッフオプション",
                    route: "apply/staff-option",
                    icon: <GroupIcon />
                },
                {
                    title: "申請ステータス",
                    route: "apply/status",
                    icon: <GroupIcon />
                },
                {
                    title: "申請カテゴリ",
                    route: "apply/apply-form-category",
                    icon: <GroupIcon />
                },
                {
                    title: "申請書",
                    route: "apply/apply-form",
                    icon: <GroupIcon />
                },
                {
                    title: "承認者",
                    route: "apply/approver",
                    icon: <GroupIcon />
                },
                {
                    title: "閲覧者",
                    route: "apply/viewer",
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
            </Stack>
        </Container>
    );
}
