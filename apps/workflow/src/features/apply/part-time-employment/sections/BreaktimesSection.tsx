"use client";

import { useState, useEffect } from "react";
import { Stack, Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { PartTimeEmploymentInput } from "../zod";
import { set } from "date-fns";

import TimeRangeField from "@ui/form/TimeRangeField";

export default function BreaktimesSection({ disabled }: { disabled?: boolean }) {
    const { control, setValue, getValues } = useFormContext<PartTimeEmploymentInput>();

    // ✅ トグルを監視
    const type = useWatch({ control, name: "employ_type" });
    const [enabled, setEnabled] = useState(false)
    useEffect(() => {
        setEnabled(type === "time");
    }, [type]);
    useEffect(() => {
        if (!enabled) {
            setValue("breaktimes", []);  // ✅ OFFなら必ず空にする
        } else {
            // ONにした瞬間に1行追加
            const cur = getValues("breaktimes");
            if (!cur?.length) setValue("breaktimes", [{
                start_time: set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }),
                end_time: set(new Date(), { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }),
            }]);
        }
    }, [enabled, setValue, getValues]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "breaktimes",
    });

    // OFFならセクションを出さない
    if (!enabled) return null;

    return (
        <Stack spacing={2} sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            {/* <FormLabel component="legend" sx={{ fontSize: "0.8em" }}>休憩時間</FormLabel> */}
            {fields.map((f, idx) => (
                <Stack key={f.id} direction={'row'} spacing={2}>
                    <TimeRangeField
                        startName={`breaktimes.${idx}.start_time`}
                        endName={`breaktimes.${idx}.end_time`}
                        labelStart="休憩開始時間"
                        labelEnd="休憩終了時間"
                        />
                    <IconButton onClick={() => remove(idx)} disabled={disabled}>
                        <DeleteIcon color="error" />
                    </IconButton>
                </Stack>
            ))}

            <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => append({
                    start_time: set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }),
                    end_time: set(new Date(), { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }),
                })}
                disabled={disabled}
            >
                休憩時間を追加
            </Button>
        </Stack>
    );
}
