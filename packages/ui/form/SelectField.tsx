"use client";

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    FormHelperText,
} from "@mui/material";

import { Controller, useFormContext, get  } from "react-hook-form";

type Props = {
    name: string;
    label?: string;
    labelId?: string;
    sx?: object;
    options: {id: string, name: string}[];
    disabled?: boolean
};

export default function SelectField({
    name,
    options,
    disabled=false,
    ...props
}: Props) {

    const {
        control,
        formState: { errors },
    } = useFormContext();

    const fieldError = get(errors, name);

    return (
        <FormControl
            fullWidth
            error={!!fieldError?.message}
            sx={props.sx}
            disabled={disabled}
            >
            <InputLabel id={props.labelId}>{props.label}</InputLabel>
            <Controller
                name={name}
                control={control}
                defaultValue=""
                render={({ field }) => (
                    <Select
                        labelId={props.labelId}
                        label={props.label}
                        {...field}
                        >
                        {options.map((option, idx: number) => (
                            <MenuItem key={idx} value={option.id}>
                                <Stack direction="row">
                                    {option.name}
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                )} />

            {fieldError && (
                <FormHelperText>
                    {(fieldError as any).message}
                </FormHelperText>
            )}
        </FormControl>
    );
}
