"use client";
import { Box } from "@mui/material";
import { useAuth } from "@contexts/AuthContext";

import LoadingScreen from "@/components/common/layout/LoadingScreen";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();

    if (!profile) { return <LoadingScreen />; }

    return (
        <Box className="bg-slate-100">
            {children}
        </Box>
    );
}
