"use client";

import { useEffect } from "react";
import { Stack, Button, IconButton, Divider, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { ChangeProfileInput } from "../zod";

import TextInputField from "@ui/form/TextInputField";
import SelectField from "@ui/form/SelectField";

export default function EmergencyContactsSection({ disabled }: { disabled?: boolean }) {
    const { control, setValue, getValues } = useFormContext<ChangeProfileInput>();

    // ✅ トグルを監視
    const enabled = useWatch({ control, name: "is_emergency_contacts_change" });
    useEffect(() => {
        if (!enabled) {
            setValue("emergency_contacts", []);  // ✅ OFFなら必ず空にする
        } else {
            // ONにした瞬間に1行追加
            const cur = getValues("emergency_contacts");
            if (!cur?.length) setValue("emergency_contacts", [{
                    name_before:"", name_after:"",
                    relation_before:"", relation_after:"",
                    phone_before: "", phone_after: "",
                }]);
        }
    }, [enabled, setValue, getValues]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "emergency_contacts",
    });

    useEffect(() => {
        if (fields.length === 0) {
            setValue("is_emergency_contacts_change", false);
        }
    }, [fields.length, setValue]);


    // OFFならセクションを出さない
    if (!enabled) return null;

    return (
        <Stack spacing={2}>
            {/* <Typography fontWeight="bold">緊急連絡先</Typography> */}

            {fields.map((f, idx) => (
                <Stack key={f.id} spacing={1} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>緊急連絡先 {idx + 1}</Typography>
                        <IconButton onClick={() => remove(idx)} disabled={disabled}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Stack spacing={1} flexGrow={1}>
                            <TextInputField name={`emergency_contacts.${idx}.name_before`} label="氏名(変更前)" disabled={disabled} />
                            <SelectField name={`emergency_contacts.${idx}.relation_before`} label="続柄(変更前)" disabled={disabled}
                                options={["夫", "妻", "子", "父", "母", "祖父", "祖母", "兄弟"].map((v) => ({ id: v, name: v }))}
                                />
                            <TextInputField name={`emergency_contacts.${idx}.phone_before`} label="電話番号(変更前)" disabled={disabled} />
                        </Stack>
                        <Stack spacing={1} flexGrow={1}>
                            <TextInputField name={`emergency_contacts.${idx}.name_after`} label="氏名(変更後)" disabled={disabled} />
                            <SelectField name={`emergency_contacts.${idx}.relation_after`} label="続柄(変更後)" disabled={disabled}
                                options={["夫", "妻", "子", "父", "母", "祖父", "祖母", "兄弟"].map((v) => ({ id: v, name: v }))}
                                />
                            <TextInputField name={`emergency_contacts.${idx}.phone_after`} label="電話番号(変更後)" disabled={disabled} />
                        </Stack>
                    </Stack>
                </Stack>
            ))}

            <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => append({
                    name_before: "", relation_before: "", phone_before: "",
                    name_after: "", relation_after: "", phone_after: "",
                })}
                disabled={disabled}
            >
                連絡先を追加
            </Button>

            <Divider />
        </Stack>
    );
}
