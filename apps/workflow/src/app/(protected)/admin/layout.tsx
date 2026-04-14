"use client";

import { useEffect } from "react";
import {
    Container,
    Toolbar,
    Box
} from "@mui/material";

import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const { user } = useAuth();

    // 管理者限定
    useEffect(() => {
        if(!user) return

        if (!user.is_admin) {
            throw new Error("管理者以外はアクセスできません");
        }
    }, [user]);

    return (
        <Box>
            <Toolbar
                sx={{
                    backgroundColor: "primary.main",
                    color: "success.contrastText",
                    fontWeight: "bold",
                    minHeight: "48px!important",
                }}
                >
                管理者用
            </Toolbar>
            <Container
                sx={{ p: 3 }}
                maxWidth="xl"
                >
                {children}
            </Container>
        </Box>
    );
}
