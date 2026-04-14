"use client";

import { FormControl, FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import SelectAnyDate from "./SelectAnyDate";

type Props = {
    name: string;
    label?: string;
    minDate?: Date;
    maxDate?: Date;
    sx?: object;
    mode? : "year" | "month" | "day";
    disabled?: boolean;
};

export default function SelectDateField({
    name,
    label,
    minDate,
    maxDate=(new Date("2050-12-31")),
    sx,
    mode="day",
    disabled=false,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <FormControl fullWidth error={!!errors[name]} sx={sx}>
            <Controller
                name={name}
                control={control}
                disabled={disabled}
                defaultValue={null}
                render={({ field, fieldState }) => (
                    <>
                        <SelectAnyDate
                            mode={mode}
                            value={field.value}
                            onChange={field.onChange}
                            label={label ?? ""}
                            minDate={minDate ?? undefined}
                            maxDate={maxDate ?? undefined}
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
