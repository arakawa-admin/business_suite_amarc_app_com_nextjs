"use client";

import { FormControl, FormHelperText, InputLabel } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import TextareaAutosize from "@mui/material/TextareaAutosize";

type Props = {
    name: string;
    label?: string;
    sx?: object;
    minRows?: number;
    maxRows?: number;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
};

export default function TextareaInputField({
    name,
    label,
    sx = { mt: 0 },
    minRows = 4,
    maxRows = 6,
    required = false,
    placeholder,
    disabled=false,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <FormControl fullWidth error={!!errors[name]} sx={sx}>
            {
                label
                && <InputLabel shrink sx={{ backgroundColor: "white", px: 0.5 }}>
                    {`${label}${required ? " (必須)" : ""}`}
                </InputLabel>
            }

            <Controller
                name={name}
                control={control}
                disabled={disabled}
                defaultValue=""
                render={({ field, fieldState }) => (
                    <>
                        <TextareaAutosize
                            {...field}
                            minRows={minRows}
                            maxRows={maxRows}
                            style={{
                                width: "100%",
                                fontSize: "1rem",
                                padding: "8.5px 14px",
                                borderRadius: 4,
                                borderColor: fieldState.invalid ? "#f44336" : "#c4c4c4",
                                borderWidth: 1,
                                borderStyle: "solid",
                                fontFamily: "inherit",
                            }}
                            placeholder={placeholder}
                        />
                        {fieldState.error && (
                            <FormHelperText>{fieldState.error.message}</FormHelperText>
                        )}
                    </>
                )}
            />
        </FormControl>
    );
}
