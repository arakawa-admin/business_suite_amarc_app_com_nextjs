"use client";

import { useMemo } from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Checkbox,
    Box,
    Chip,
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

export default function MultipleSelectCheckmarkField({
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
    const idToName = useMemo(() => {
        const map = new Map<string, string>();
        options.forEach((o) => map.set(o.id, o.name));
        return map;
    }, [options]);

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
                        multiple
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {(selected as string[]).map((id) => (
                                    <Chip
                                        key={id}
                                        label={idToName.get(id) ?? ""}
                                        size="small"
                                        />
                                ))}
                            </Box>
                        )}
                        {...field}
                        >
                        {options.map((option, idx: number) => {
                            return (
                                <MenuItem key={idx} value={option.id}>
                                    <Checkbox checked={(field.value ?? []).includes(option.id)} />
                                    {option.name}
                                </MenuItem>
                            )
                        })}
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
