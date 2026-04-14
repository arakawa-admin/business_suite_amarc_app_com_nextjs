"use client";

import { useEffect, useMemo } from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    FormHelperText,
    Skeleton,
    Box,
    Chip,
    Checkbox,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

import { Controller, useFormContext, get  } from "react-hook-form";
import useSWR from "swr";

import { MasterDepartmentType } from "../../schemas/common/masterDepartmentSchema";

type Props = {
    name: string;
    label?: string;
    labelId?: string;
    sx?: object;
    errorText?: string;
    required?: boolean;
    nonDefault?: boolean;
    multiple?: boolean;
    showChips?: boolean;
    disabled?: boolean
    includeAll?: boolean
};

import { FetchResult } from "../../db-types/fetch-result";
import { getMasterDepartments } from '../../lib/actions/common/masterDepartment';
// const fetcher = () => fetch("/api/master-departments").then(res => res.json());

export default function DepartmentSelectField({
    name = "department_id",
    // label = "部門",
    // labelId = "department-label",
    // sx = { mb: 0 },
    // errorText,
    required = false,
    nonDefault = true,
    multiple = false,
    showChips = true,
    disabled = false,
    includeAll = true,
    ...props
}: Props) {

    const { profile } = useAuth();

    const {
        control,
        formState: { errors },
        setValue,
        getValues,
    } = useFormContext();

    const {
        data: result,
        error,
        isLoading
    } = useSWR<FetchResult<MasterDepartmentType[]>>(
        "masterDepartmentType",
        getMasterDepartments,
        // fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5_000,
        }
    );

    const departments = useMemo(() => {
        const depts = result?.ok ? result.data : [];

        const filterd = depts.filter((dept: MasterDepartmentType) => ["admin", "viewer"].includes(dept.code!) === false)
        if(includeAll) return filterd; // 全て表示

        const memberDeptIds = profile?.memberships?.map(m => m.department_id) ?? [];
        return filterd.filter((dept: MasterDepartmentType) => memberDeptIds.includes(dept.id!)) // 所属部門のみ表示
    }, [result, profile, includeAll]);

    const fieldError = get(errors, name);
    const labelText = props.label ? `${props.label}${required ? " (必須)" : ""}` : "";

    // 初期値をセットする場合
    useEffect(() => {
        if (nonDefault) return;
        if (!departments.length) return;

        const current = getValues(name);
        if (multiple) {
            const arr = Array.isArray(current) ? current : [];
            if (arr.length === 0) {
                setValue(name, [departments[0].id], { shouldValidate: true });
            }
        } else {
            if (!current) {
                setValue(name, departments[0].id, { shouldValidate: true });
            }
        }
    }, [departments, getValues, name, setValue, nonDefault, multiple]);

    // id -> name の辞書（renderValue用）
    const deptNameById = useMemo(() => {
        const m = new Map<string, string>();
        departments.forEach((d: any) => {
            if (d.id) m.set(String(d.id), d.name ?? "");
        });
        return m;
    }, [departments]);

    if (isLoading) return <Skeleton variant="rounded" height={"3em"} animation="wave" />;

    return (
        <FormControl
            fullWidth
            error={Boolean((fieldError as any)?.message) || Boolean(error)}
            sx={props.sx}
            disabled={isLoading}
            >
            <InputLabel id={props.labelId}>{labelText}</InputLabel>
            <Controller
                name={name}
                control={control}
                defaultValue={multiple ? ([] as string[]) : ""}
                disabled={disabled}
                render={({ field }) => {
                    // multiple=true のとき Select の value は配列にする
                    const value = multiple
                        ? (Array.isArray(field.value) ? field.value : []) // 安全化
                        : (field.value ?? "");
                    return (
                        <Select
                            labelId={props.labelId}
                            label={labelText}
                            multiple={multiple}
                            value={value}
                            // {...field}
                            onChange={(e) => {
                                // multiple は string[]、single は string
                                field.onChange(e.target.value);
                            }}
                            renderValue={
                                multiple
                                ? (selected) => {
                                    const ids = Array.isArray(selected) ? selected : [];
                                    if (!showChips) {
                                        return ids.map((id) => deptNameById.get(String(id)) ?? String(id)).join(", ");
                                    }
                                    return (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {ids.map((id) => (
                                                <Chip
                                                key={String(id)}
                                                size="small"
                                                label={deptNameById.get(String(id)) ?? String(id)}
                                                />
                                            ))}
                                        </Box>
                                    );
                                }
                                : undefined
                            }
                            // RHFが持つ onBlur/name/ref を渡す
                            onBlur={field.onBlur}
                            name={field.name}
                            inputRef={field.ref}
                            disabled={disabled}
                            >
                            {departments.map((department: any) => (
                                <MenuItem key={department.id} value={department.id}>
                                    {multiple && <Checkbox checked={Array.isArray(value) && value.includes(department.id)} />}
                                    {department.name}
                                </MenuItem>
                            ))}
                        </Select>
                    )
                }}
            />
            {fieldError && (
                <FormHelperText>
                    {(fieldError as any).message}
                </FormHelperText>
            )}
        </FormControl>
    );
}
