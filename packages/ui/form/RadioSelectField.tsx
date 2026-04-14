"use client";

import {
    FormControl,
    FormLabel,
    FormHelperText,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { Controller, useFormContext, get } from "react-hook-form";
import { useEffect, useMemo } from "react";

export type RadioOption = {
    id: string;
    name: string;
    subLabel?: string;
};

type Props = {
    name: string;                 // RHFのフィールド名
    label?: string;               // 見出し
    options: RadioOption[];       // [{id,name},...]
    sx?: object;
    nonDefault?: boolean;         // trueなら自動初期選択しない
    disabled?: boolean;
    row?: boolean;                // 横並びにする
};

export default function RadioSelectField({
    name,
    label,
    options,
    sx,
    nonDefault = false,
    disabled = false,
    row = false,
}: Props) {
    const {
        control,
        formState: { errors },
        setValue,
        getValues,
    } = useFormContext();

    const fieldError = get(errors, name);

    const normalized = useMemo(
        () => (options ?? []).filter((o) => o?.id),
        [options]
    );

    useEffect(() => {
        if (nonDefault) return;
        if (!normalized.length) return;

        const current = getValues(name);
        if (!current) {
            setValue(name, normalized[0].id, { shouldValidate: true });
        }
    }, [normalized, getValues, name, setValue, nonDefault]);

    return (
        <FormControl
            component="fieldset"
            fullWidth
            error={!!(fieldError as any)?.message}
            sx={sx}
            disabled={disabled}
        >
            {label && <FormLabel component="legend" sx={{ fontSize: "0.8em" }}>{label}</FormLabel>}

            <Controller
                name={name}
                control={control}
                defaultValue=""
                render={({ field }) => (
                    <RadioGroup
                        row={row}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                    >
                        {normalized.map((opt) => (
                            <FormControlLabel
                                key={opt.id}
                                value={opt.id}
                                control={<Radio />}
                                label={opt.subLabel ? `${opt.name} ${opt.subLabel}` : opt.name}
                            />
                        ))}
                    </RadioGroup>
                )}
            />

            {fieldError && (
                <FormHelperText>{(fieldError as any).message}</FormHelperText>
            )}
        </FormControl>
    );
}
