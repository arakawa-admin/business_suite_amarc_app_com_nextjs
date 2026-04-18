import { notFound } from "next/navigation";
import { Box, Container } from "@mui/material";
import { PermitCommentForm } from "@/features/permits/comments/components/PermitCommentForm";
import { findPermitById } from "@/features/permits/repositories/permitRepository";

export default async function PermitCommentNewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const permit = await findPermitById(id);
    if (!permit) notFound();

    return (
        <Container maxWidth="md">
            <Box py={4}>
                <PermitCommentForm permitId={permit.id} />
            </Box>
        </Container>
    );
}
