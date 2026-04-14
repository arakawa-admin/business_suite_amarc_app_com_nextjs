"use client";

import { Grid, Stack, Typography, Paper,
    // Chip
} from "@mui/material";

import { EndTrialEmploymentInput } from "../zod";
import UploadedFileList from "@ui/form/file/UploadedFileList";
import { AttachmentType } from "@/schemas/apply/attachmentSchema";
type RevisionAttachment = {
    id: string;
    attachment: AttachmentType;
};

export default function SkillsSectionReadOnly({
    skills,
    revision_attachments,
}: {
    skills: EndTrialEmploymentInput["skills"]
    revision_attachments: RevisionAttachment[]
}) {
    const attachmentByAttaId = new Map<string, RevisionAttachment>(
        revision_attachments?.map((a) => [a.id, a])
    );
    const skillAttachments = (ids: string[]): AttachmentType[] => {
        return ids
            .map((id) => {return attachmentByAttaId.get(id)?.attachment})
            .filter(Boolean) as AttachmentType[]
    };

    skillAttachments(skills?.[0]?.attachment_revision_ids ?? []);

    return (
        <Grid container spacing={2}>
            {skills?.map((skill, index) => (
                <Grid key={index} size={6}>
                    <Paper key={index} sx={{ p: 2 }} variant="outlined">
                        <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>技能手当 {index+1}</Typography>
                                <Paper sx={{ p: 2 }} variant="outlined">
                                    <Stack spacing={1}>
                                        <Typography variant="body2">{skill.skill_name}</Typography>
                                        <UploadedFileList
                                            attachments={skillAttachments(skill.attachment_revision_ids ?? [])}
                                            // subtitle={index!==0 && <Chip label={`改訂${index}版`} color="warning" variant="outlined" size="small" />}
                                            fetchUrl={"/api/apply/attachments/signed-urls"}
                                            size={12}
                                            onRemove={() => {}}
                                            />
                                    </Stack>
                                </Paper>
                        </Stack>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}
