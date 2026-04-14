"use client";

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    FormHelperText,
    Skeleton,
} from "@mui/material";

import { useEffect, useMemo } from "react";
import { Controller, useFormContext, get  } from "react-hook-form";
import useSWR from "swr";

import { getApplyFormCategorys } from "@/lib/actions/apply/applyFormCategory";
import { ApplyFormCategoryType } from "@/schemas/apply/applyFormCategorySchema";

type Props = {
    name?: string;
    label?: string;
    labelId?: string;
    sx?: object;
    errorText?: string;
    nonDefault?: boolean;
    disabled?: boolean
};

const fetcher = () => getApplyFormCategorys();
import { FetchResult } from "@/types/fetch-result";

export default function ApplyFormCategorySelectField({
    name = "apply_form_id",
    nonDefault=false,
    disabled=false,
    ...props
}: Props) {

    const {
        control,
        formState: { errors },
        setValue,
        getValues,
    } = useFormContext();

    const {
        data: result,
        error, isLoading
    } = useSWR<FetchResult<ApplyFormCategoryType[]>>(
        "applyFormCategoryType",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5_000,
        }
    );

    const applyFormCategorys = useMemo(() => {
        if(!result) return []
        return result?.ok ? result.data.sort((a, b) => a.sort_order - b.sort_order) : [];
    }, [result]);
    const fieldError = get(errors, name);

    // 初期値をセットする場合
    useEffect(() => {
        if (nonDefault) return;
        if (!applyFormCategorys.length) return;

        const current = getValues(name);
        if (!current) {
            setValue(name, applyFormCategorys[0].id, { shouldValidate: true });
        }
    }, [applyFormCategorys, getValues, name, setValue, nonDefault]);

    return (
        isLoading ? <Skeleton variant="rounded" height={"3em"} animation="wave" /> :
        <FormControl
            fullWidth
            error={!!errors[name]?.message || !!error}
            sx={props.sx}
            disabled={disabled || isLoading}
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
                        {applyFormCategorys.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                <Stack direction="row">
                                    {category.name}
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
