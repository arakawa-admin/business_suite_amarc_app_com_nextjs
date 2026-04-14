"use client";

import { useEffect } from "react";
import { Stack, Button, IconButton, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { PartTimeEmploymentInput } from "../zod";

import TextInputField from "@ui/form/TextInputField";
import FileInputField from "@ui/form/FileInputField";

export default function SkillsSection({ disabled }: { disabled?: boolean }) {
    const { control, setValue, getValues } = useFormContext<PartTimeEmploymentInput>();

    useEffect(() => {
        // ONにした瞬間に1行追加
        const cur = getValues("skills");
        if (!cur?.length) setValue("skills", [{
            skill_name: "",
            post_files: [],
        }]);
    }, [setValue, getValues]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "skills",
    });

    return (
        <Stack spacing={2} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Grid container spacing={2}>
                {fields.map((f, idx) => (
                    <Grid size={6} key={f.id}>
                        <Stack spacing={2} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                            <Stack direction={'row'} spacing={1}>
                                <TextInputField name={`skills.${idx}.skill_name`} label="技能手当名" disabled={disabled} />
                                <IconButton onClick={() => remove(idx)} disabled={disabled}>
                                    <DeleteIcon color="error" />
                                </IconButton>
                            </Stack>
                            <FileInputField
                                name={`skills.${idx}.post_files`}
                                label="資格証等"
                                disabled={disabled}
                                canDrop={false}
                                maxFiles={1}
                                multiple={false}
                                previewSize={12}
                                />
                        </Stack>
                    </Grid>
                ))}
            </Grid>

            <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => append({
                    skill_name: "",
                    post_files: [],
                })}
                disabled={disabled}
            >
                技能手当を追加
            </Button>
        </Stack>
    );
}
