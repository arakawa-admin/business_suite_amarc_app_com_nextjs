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
import { Controller, useFormContext, get } from "react-hook-form";
import useSWR from "swr";

import { getMasterStaffs } from "../../lib/actions/common/masterStaff";
import { MasterStaffType } from "../../schemas/common/masterStaffSchema";

type Props = {
    name?: string;
    label?: string;
    labelId?: string;
    sx?: object;
    errorText?: string;
    nonDefault?: boolean;
    disabled?: boolean;
    exceptIds?: Array<string>;
};

const fetcher = () => getMasterStaffs();
import { FetchResult } from "../../types/fetch-result";

export default function StaffSelectField({
    name = "staff_id",
    // label = "担当者",
    // labelId = "staff-label",
    // sx = { mb: 0 },
    // errorText,
    nonDefault=false,
    disabled=false,
    exceptIds,
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
    } = useSWR<FetchResult<MasterStaffType[]>>(
        "masterStaffType",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5_000,
        }
    );

    const staffs = useMemo(() => {
        if(!result) return []
        if(exceptIds && exceptIds.length>0){
            const filtered = result?.ok ? result.data.filter((staff) => !exceptIds.includes(staff.id)) : [];
            return filtered;
        }
        return result?.ok ? result.data : [];
    }, [result, exceptIds]);
    const fieldError = get(errors, name);

    // 初期値をセットする場合
    useEffect(() => {
        if (nonDefault) return;
        if (!staffs.length) return;

        const current = getValues(name);
        if (!current) {
            setValue(name, staffs[0].id, { shouldValidate: true });
        }
    }, [staffs, getValues, name, setValue, nonDefault]);

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
                        {staffs.map((staff) => (
                            <MenuItem key={staff.id} value={staff.id}>
                                <Stack direction="row">
                                    {staff.name} ({staff.kana})
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
