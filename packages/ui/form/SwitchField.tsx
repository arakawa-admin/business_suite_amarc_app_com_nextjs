"use client";

import { FormGroup, FormControl, FormControlLabel, Switch, FormLabel, FormHelperText } from "@mui/material";
import { Controller, useFormContext, get } from "react-hook-form";

type Props = {
    name: string;
    title?: string;
    label?: {
        true: string;
        false: string;
    };
    sx?: object;
    disabled?: boolean;
};

export default function SwitchField({
    name,
    title,
    label,
    sx = { mt: 0 },
    disabled=false,
}: Props) {
    const {
        control,
        // register,
        formState: { errors },
    } = useFormContext();

    const fieldError = get(errors, name);

    return (
        <FormControl
            fullWidth
            error={Boolean((fieldError as any)?.message)}
            // error={!!errors[name]}
            sx={sx}
            >
            {title && <FormLabel sx={{ mx: 1, fontSize: "0.8em" }}>{title}</FormLabel>}
            <Controller
                name={name}
                control={control}
                defaultValue={false}
                disabled={disabled}
                render={({ field }) => (
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    name={field.name}
                                    // inputRef={field.ref}
                                    onBlur={field.onBlur}
                                    // checked={!!field.value}
                                    onChange={(_, checked) => field.onChange(checked)}
                                    checked={Boolean(field.value)}
                                    // {...register(name)}
                                    />
                            }
                            label={
                                !label
                                    ? ""
                                    : Boolean(field.value) ? label.true : label.false
                                }
                        />
                    </FormGroup>
                )}
            />
            {fieldError && (
                <FormHelperText>
                    {(fieldError as any).message}
                </FormHelperText>
            )}
        </FormControl>
    );
}
