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
import { Controller, useFormContext, get, useWatch } from "react-hook-form";
import useSWR from "swr";

import { getMasterStaffs } from "@/lib/actions/common/masterStaff";
import { MasterStaffType } from "@/schemas/common/masterStaffSchema";

type Props = {
    name?: string;
    label?: string;
    labelId?: string;
    sx?: object;
    errorText?: string;
    nonDefault?: boolean;
    disabled?: boolean;
    includeAll?: boolean
    exceptRetire?: boolean
    validEmployType?: string;
};

const fetcher = () => getMasterStaffs();
import { FetchResult } from "@/types/fetch-result";

export default function StaffSelectField({
    name = "staff_id",
    // label = "担当者",
    // labelId = "staff-label",
    // sx = { mb: 0 },
    // errorText,
    nonDefault=false,
    disabled=false,
    includeAll = false,
    exceptRetire = true,
    validEmployType,
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

    const watchingDepartmentId = useWatch({
        control: control,
        name: "department_id",
    });
    const staffs = useMemo(() => {
        if(!result) return []

        const filterd = result?.ok ? result.data : [];
        if(includeAll) return filterd; // 全て表示

        if(watchingDepartmentId) {
            let s = filterd;
            if(exceptRetire) {
                s = filterd.filter((staff) => {
                    return staff.staff_option?.employ_type.code !== "retirement"
                });
            }
            if(!!validEmployType) {
                s = filterd.filter((staff) => staff.staff_option?.employ_type.code === validEmployType);
            }
            return s.filter((staff) => staff.memberships.some((m) => {
                return m.department.id === watchingDepartmentId
            }));
        }

        return []
    }, [result, includeAll, watchingDepartmentId, validEmployType, exceptRetire]);
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
