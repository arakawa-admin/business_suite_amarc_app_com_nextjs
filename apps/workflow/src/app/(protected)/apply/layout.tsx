"use client";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useActiveSystem } from "@/contexts/ActiveSystemContext";
import LoadingScreen from "@/components/common/layout/LoadingScreen";
import { Box, Toolbar } from "@mui/material";
import { grey } from '@mui/material/colors';

export default function ApprovalLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { activeSystem } = useActiveSystem();
    const { profile } = useAuth();

    if ( activeSystem !== "apply" ) {
        router.push("/select/active-system");
        return;
    }

    if (!profile) { return <LoadingScreen />; }

    return (
        <Box sx={{ backgroundColor: grey[100], minHeight: "100vh" }}>
            <Toolbar
                sx={{
                    backgroundColor: "success.main",
                    color: "success.contrastText",
                }}
                variant="dense"
                >
                申請システム
            </Toolbar>
            {children}
        </Box>
    );
}
