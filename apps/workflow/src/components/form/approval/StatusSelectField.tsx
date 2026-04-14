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

import { getMasterStatus } from "@/lib/actions/approval/masterStatus";
import { MasterStatusType } from "@/schemas/approval/masterStatusSchema";

type Props = {
    name?: string;
    label?: string;
    labelId?: string;
    sx?: object;
    errorText?: string;
    nonDefault?: boolean;
    disabled?: boolean
};

const fetcher = () => getMasterStatus();
import { FetchResult } from "@/types/fetch-result";

export default function StatusSelectField({
    name = "status_id",
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
    } = useSWR<FetchResult<MasterStatusType[]>>(
        "masterStatusType",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5_000,
        }
    );

    const status = useMemo(() => {
        if(!result) return []
        return result?.ok ? result.data.sort((a, b) => a.sort_order - b.sort_order) : [];
    }, [result]);
    const fieldError = get(errors, name);

    // 初期値をセットする場合
    useEffect(() => {
        if (nonDefault) return;
        if (!status.length) return;

        const current = getValues(name);
        if (!current) {
            setValue(name, status[0].id, { shouldValidate: true });
        }
    }, [status, getValues, name, setValue, nonDefault]);

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
                        {status.map((status) => (
                            <MenuItem key={status.id} value={status.id}>
                                <Stack direction="row">
                                    {status.name}
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
