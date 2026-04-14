"use client";

import { FormControl } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { TimePicker } from "@mui/x-date-pickers";

type Props = {
    name: string;
    label?: string;
    sx?: object;
    disabled?: boolean;
    minutesStep?: number;
};

export default function SelectTimeField({
    name,
    label,
    sx,
    disabled=false,
    minutesStep = 5,
}: Props) {
    const { control } = useFormContext();

    return (
        <FormControl fullWidth sx={sx}>
            <Controller
                name={name}
                control={control}
                disabled={disabled}
                defaultValue={null}
                render={({ field, fieldState }) => (
                    <TimePicker
                        label={label ?? ""}
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v)}
                        disabled={disabled}
                        minutesStep={minutesStep}
                        slotProps={{
                            textField: {
                                error: !!fieldState.error,
                                helperText: fieldState.error?.message,
                            },
                        }}
                    />
                )}
            />
        </FormControl>
    );
}
