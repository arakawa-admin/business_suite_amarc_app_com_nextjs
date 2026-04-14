"use client";

import { FormControl, TextField, InputAdornment } from "@mui/material";
import { Controller, useFormContext, get } from "react-hook-form";

type Props = {
    name: string;
    label?: string;
    sx?: object;
    required?: boolean;
    disabled?: boolean;
    startAdornment?: string;
    endAdornment?: string;
};

export default function TextInputField({
    name,
    label,
    sx,
    required = false,
    disabled = false,
    startAdornment,
    endAdornment,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    // name が "foo.bar" みたいでも取れる
    const fieldError = get(errors, name);

    return (
        <FormControl
            fullWidth
            error={!!errors[name]}
            sx={sx}
            >
            <Controller
                name={name}
                control={control}
                defaultValue={""}
                disabled={disabled}
                render={({ field }) => (
                    <>
                    <TextField
                        {...field}
                        label={label ? `${label}${required ? " (必須)" : ""}` : ""}
                        sx={sx}
                        error={!!fieldError}
                        helperText={(fieldError as any)?.message ?? ""}
                        slotProps={{
                            input: {
                                startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
                                endAdornment: endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>,
                            },
                        }}
                        />
                    </>
                )}
            />
        </FormControl>
    );
}
