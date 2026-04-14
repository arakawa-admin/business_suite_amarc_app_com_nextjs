"use client";
import { useAuth } from "@/contexts/AuthContext";

import LoadingScreen from "@/components/common/layout/LoadingScreen";
import { Container } from "@mui/material";

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    if (!profile) { return <LoadingScreen />; }

    return (
        <Container
            sx={{ p: 3, mb: 6 }}
            maxWidth="lg"
            >
            {children}
        </Container>
    );
}
