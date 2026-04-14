"use client";

import { useEffect } from "react";
import { Stack, Button, IconButton, Divider, Typography, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { ChangeProfileInput } from "../zod";

import TextInputField from "@ui/form/TextInputField";
import SelectField from "@ui/form/SelectField";
import SelectDateField from "@ui/form/SelectDateField";
import SwitchField from "@ui/form/SwitchField";

export default function DependentsSection({ disabled }: { disabled?: boolean }) {
    const { control, setValue, getValues } = useFormContext<ChangeProfileInput>();

    // ✅ トグルを監視
    const enabled = useWatch({ control, name: "is_dependent_change" });
    useEffect(() => {
        if (!enabled) {
            setValue("dependents", []);  // ✅ OFFなら必ず空にする
        } else {
            // ONにした瞬間に1行追加
            const cur = getValues("dependents");
            if (!cur?.length) setValue("dependents", [{
                    is_add_dependent: true,
                    name:"", kana:"",
                    birthday: new Date(), gender:"",
                    relation:"", residence:"",
                    zipcode: "", address: "",
                }]);
        }
    }, [enabled, setValue, getValues]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "dependents",
    });

    useEffect(() => {
        if (fields.length === 0) {
            setValue("is_dependent_change", false);
        }
    }, [fields.length, setValue]);


    // OFFならセクションを出さない
    if (!enabled) return null;

    return (
        <Stack spacing={2}>
            {/* <Typography fontWeight="bold">扶養</Typography> */}

            {fields.map((f, idx) => (
                <Stack key={f.id} spacing={1} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography>扶養 {idx + 1}</Typography>
                        <IconButton onClick={() => remove(idx)} disabled={disabled}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <SwitchField name="is_add_dependent" label={ {true: "扶養に追加", false: "扶養から削除"} } disabled={disabled} />
                        </Grid>
                        <Grid size={6}>
                            <TextInputField name={`dependents.${idx}.name`} label="名前" disabled={disabled} />
                        </Grid>
                        <Grid size={6}>
                            <TextInputField name={`dependents.${idx}.kana`} label="カナ" disabled={disabled} />
                        </Grid>
                        <Grid size={6}>
                            <SelectField name={`dependents.${idx}.relation`} label="続柄" disabled={disabled}
                                options={["夫", "妻", "子", "父", "母", "祖父", "祖母", "兄弟"].map((v) => ({ id: v, name: v }))}
                                />
                        </Grid>
                        <Grid size={6}>
                            <SelectDateField name={`dependents.${idx}.birthday`} label="生年月日" disabled={disabled} />
                        </Grid>
                        <Grid size={6}>
                            <SelectField name={`dependents.${idx}.gender`} label="性別" disabled={disabled}
                                options={["男性", "女性"].map((v) => ({ id: v, name: v }))}
                                />
                        </Grid>
                        <Grid size={6}>
                            <SelectField name={`dependents.${idx}.residence`} label="居住" disabled={disabled}
                                options={["同居", "別居"].map((v) => ({ id: v, name: v }))}
                                />
                        </Grid>
                        <Grid size={6}>
                            <TextInputField name={`dependents.${idx}.zipcode`} label="郵便番号" disabled={disabled} />
                        </Grid>
                        <Grid size={6}>
                            <TextInputField name={`dependents.${idx}.address`} label="住所" disabled={disabled} />
                        </Grid>
                    </Grid>
                </Stack>
            ))}

            <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => append({
                    is_add_dependent: true,
                    name:"", kana:"",
                    birthday: new Date(), gender:"",
                    relation:"", residence:"",
                    zipcode: "", address: "",
                })}
                disabled={disabled}
            >
                扶養を追加
            </Button>

            <Divider />
        </Stack>
    );
}
