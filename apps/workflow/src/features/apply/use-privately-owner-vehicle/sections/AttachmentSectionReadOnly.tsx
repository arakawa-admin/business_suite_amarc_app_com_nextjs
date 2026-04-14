"use client";

import { Stack, Typography, Paper } from "@mui/material";

import UploadedFileList from "@ui/form/file/UploadedFileList";
import { AttachmentType } from "@/schemas/apply/attachmentSchema";
import { ApplicationRevisionLike } from "@/components/apply/parts/ReadOnlyRenderer";

type RevisionAttachment = {
    id: string;
    attachment: AttachmentType;
    label: string;
};

export default function AttachmentSectionReadOnly({
    type,
    revisions,
}: {
    type: "免許証" | "車検証" | "任意保険証";
    revisions: ApplicationRevisionLike[];
}) {
    const revisionAttachments: RevisionAttachment[] =
        (revisions
            .flatMap((r) => (r.payload as any)?.revision_attachments ?? [])
            .map((ra) => ({ id: ra.id, label: ra.label, attachment: ra.attachment as AttachmentType }))
            .filter(((ra) => ra.label==type))
        )
        ?? [];
    return (
        <Paper sx={{ p: 2 }} variant="outlined">
            <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{type}</Typography>
                <Stack spacing={1}>
                    <UploadedFileList
                        attachments={revisionAttachments.map((ra) => ra.attachment)}
                        fetchUrl={"/api/apply/attachments/signed-urls"}
                        size={12}
                        onRemove={() => {}}
                        />
                </Stack>
            </Stack>
        </Paper>
    );
}
