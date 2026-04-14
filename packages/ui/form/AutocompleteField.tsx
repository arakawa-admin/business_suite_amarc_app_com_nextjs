"use client";
import {
    Autocomplete,
    FormControl,
    TextField,
} from "@mui/material";
import { Controller, get, useFormContext } from "react-hook-form";

type Option = {
    id: string;
    name: string;
};

type Props = {
    name: string;
    label?: string;
    placeholder?: string;
    sx?: object;
    options: Option[];
    freeSolo?: boolean;
    required?: boolean;
    disabled?: boolean;
};

export default function AutocompleteField({
    name,
    label,
    placeholder,
    sx,
    options,
    freeSolo = false,
    required = false,
    disabled = false,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const fieldError = get(errors, name);

    return (
        <FormControl
            fullWidth
            error={!!fieldError}
            sx={sx}
            disabled={disabled}
        >
            <Controller
                name={name}
                control={control}
                defaultValue=""
                disabled={disabled}
                render={({ field }) => {
                    const currentValue =
                        typeof field.value === "string" ? field.value : "";

                    const selectedOption =
                        options.find((option) => option.name === currentValue) ?? null;

                    return (
                        <Autocomplete
                            freeSolo={freeSolo}
                            options={options}
                            value={selectedOption}
                            disabled={disabled}
                            getOptionLabel={(option) =>
                                typeof option === "string" ? option : option.name
                            }
                            isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                            }
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === "input" || reason === "clear") {
                                    field.onChange(newInputValue);
                                }
                            }}
                            onChange={(_, selected) => {
                                if (typeof selected === "string") {
                                    field.onChange(selected);
                                    return;
                                }

                                if (selected) {
                                    field.onChange(selected.name);
                                    return;
                                }

                                field.onChange("");
                            }}
                            onBlur={field.onBlur}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={placeholder ?? label}
                                    label={label ? `${label}${required ? " (必須)" : ""}` : ""}
                                    error={!!fieldError}
                                    helperText={(fieldError as { message?: string })?.message ?? ""}
                                />
                            )}
                        />
                    );
                }}
            />
        </FormControl>
    );
}
