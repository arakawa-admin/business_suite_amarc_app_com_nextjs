"use client";

import { useEffect } from "react";
import { Stack, Button, IconButton, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFieldArray, useFormContext
    // , useWatch
} from "react-hook-form";
import type { QualificationCompensationInput } from "../zod";

import TextInputField from "@ui/form/TextInputField";
import FileInputField from "@ui/form/FileInputField";
import SwitchField from "@ui/form/SwitchField";
import SelectDateField from "@ui/form/SelectDateField";

export default function SkillsSection({ disabled }: { disabled?: boolean }) {
    const { control, setValue, getValues } = useFormContext<QualificationCompensationInput>();

    useEffect(() => {
        // ONにした瞬間に1行追加
        const cur = getValues("skills");
        if (!cur?.length) setValue("skills", [{
            is_add: true,
            skill_name: "",
            applicable_month: new Date(),
            post_files: [],
        }]);
    }, [setValue, getValues]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "skills",
    });

    return (
        <Stack spacing={2} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            {fields.map((f, idx) => (
                <Stack spacing={2} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }} key={f.id}>
                    <Grid container spacing={2} alignItems={"center"}>
                        <Grid>
                            <SwitchField name={`skills.${idx}.is_add`} label={{true: "追加", false: "削除"}} disabled={disabled} />
                        </Grid>
                        <Grid>
                            <SelectDateField name={`skills.${idx}.applicable_month`} label="適用月" mode="month" disabled={disabled} />
                        </Grid>
                        <Grid size="grow">
                            <TextInputField name={`skills.${idx}.skill_name`} label="技能手当名" disabled={disabled} />
                        </Grid>
                        <Grid>
                            <IconButton onClick={() => remove(idx)} disabled={disabled}>
                                <DeleteIcon color="error" />
                            </IconButton>
                        </Grid>
                    </Grid>
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
            ))}

            <Button
                startIcon={<AddIcon />}
                // variant="outlined"
                color="warning"
                onClick={() => append({
                    is_add: true,
                    skill_name: "",
                    applicable_month: new Date(),
                    post_files: [],
                })}
                size="large"
                sx={{ fontWeight: "bold" }}
                disabled={disabled}
            >
                技能手当を追加
            </Button>
        </Stack>
    );
}
