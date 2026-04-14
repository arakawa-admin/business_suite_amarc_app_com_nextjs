"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Box } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveSystem } from "@/contexts/ActiveSystemContext";

import LoadingScreen from "@/components/common/layout/LoadingScreen";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const { profile } = useAuth();
    const { activeSystem } = useActiveSystem()

    // ** checkActiveSystem ** //
    useEffect(() => {
        if (!activeSystem) {
            router.push("/select/active-system");
            return;
        }
    }, [activeSystem, router]);
    // ** checkActiveSystem ** //

    if (!profile) { return <LoadingScreen />; }

    return (
        <Box className="bg-slate-100">
            {children}
        </Box>
    );
}
