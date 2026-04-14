"use client";

import {
    FormControl,
    FormHelperText,
    Slider,
    Box,
    Typography,
    Paper
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useFormContext, Controller } from "react-hook-form";

type Props = {
    name?: "price";
    label?: string;
    sx?: SxProps<Theme>;
    min?: number;
    max?: number;
    step?: number;
};
const MIN = 0;
const MAX = 1000000;

export default function PriceRangeField({
    name = "price",
    label = "金額",
    sx = { mb: 0 },
    min = MIN,
    max = MAX,
    step = 10000,
}: Props) {

    const { control, formState: { errors } } = useFormContext();

    const yen = (v: number) => `¥ ${v.toLocaleString()}`;

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <FormControl fullWidth error={!!errors[name]} sx={sx}>
                <Controller
                    name={name}
                    control={control}
                    defaultValue={[min, max]}
                    render={({ field }) => (
                        <Box>
                            <Typography
                                color="textSecondary"
                                variant="body2"
                                >
                                {label}: {yen(field.value[0])} ~ {yen(field.value[1])}
                            </Typography>
                            <Slider
                                aria-label={label}
                                value={
                                    Array.isArray(field.value)
                                        ? field.value
                                        : [min, max]
                                    }
                                onChange={(_, v) => field.onChange(v as number[])}
                                valueLabelDisplay="auto"
                                getAriaValueText={yen}
                                valueLabelFormat={yen}
                                min={min}
                                max={max}
                                step={step}
                                disableSwap
                                />
                        </Box>
                    )}
                />
                {(errors)?.[name]?.message && (
                    <FormHelperText>
                    {(errors)[name]?.message as string}
                    </FormHelperText>
                )}
            </FormControl>
        </Paper>
    );
}
