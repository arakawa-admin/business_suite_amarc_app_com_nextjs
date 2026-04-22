import { Container, Stack } from "@mui/material";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <Container maxWidth="xl" sx={{ p: 2 }}>
            <Stack spacing={1}>
                {children}
            </Stack>
        </Container>
    );
}
