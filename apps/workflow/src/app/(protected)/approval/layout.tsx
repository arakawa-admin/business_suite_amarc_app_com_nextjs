"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useActiveSystem } from "@/contexts/ActiveSystemContext";
import LoadingScreen from "@/components/common/layout/LoadingScreen";
import { Box, Toolbar } from "@mui/material";

export default function ApprovalLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { activeSystem } = useActiveSystem();
    const { profile } = useAuth();

    useEffect(() => {
        if ( activeSystem !== "approval" ) {
            router.push("/select/active-system");
            return;
        }
    }, [activeSystem, router]);

    if (!profile) { return <LoadingScreen />; }

    return (
        <Box>
            <Toolbar
                sx={{
                    backgroundColor: "success.main",
                    color: "success.contrastText",
                    // fontWeight: "bold"
                }}
                variant="dense"
                >
                稟議書システム
            </Toolbar>
            {children}
        </Box>
    );
}
