"use client";

import LoadingScreen from "@/components/common/layout/LoadingScreen";

import { useAuth } from "@/contexts/AuthContext";

import Header from "@/components/common/layout/Header";

import { Box } from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;

    return (
        <Box
            sx={{
                backgroundColor: "#fafafa",
            }}
            >
            <Header />

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                {children}
            </LocalizationProvider>
        </Box>
    );
}
