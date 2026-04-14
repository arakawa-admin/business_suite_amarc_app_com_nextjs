"use client";

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    FormHelperText,
} from "@mui/material";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { MasterLoginUserType } from "../../schemas/common/masterLoginUserSchema";

import { getMasterLoginUsers } from "../../lib/actions/common/masterLoginUser";

type Props = {
    name?: "login_user_id";
    label?: string;
    labelId?: string;
    sx?: object;
};

export default function LoginUserSelectField({
    name = "login_user_id",
    label = "ログインユーザ",
    labelId = "login-user-label",
    sx = { mb: 0 },
}: Props) {

    const {
        register,
        watch,
        formState: { errors },
        setValue,
    } = useFormContext();
    // } = useFormContext<MasterLoginUserType>();

    const value = watch(name) ?? "";

    const [loginUsers, setLoginUsers] = useState<MasterLoginUserType[]>([]);
    useEffect(() => {
        (async () => {
            const res = await getMasterLoginUsers();
            if(res.data) {
                setLoginUsers(res.data.sort((a, b) => a.email > b.email ? 1 : -1));
                if (res.data.length > 0) {
                    setValue("login_user_id", res.data[0].id);
                }
            }
        })();
    }, [setValue]);

    return (
        <FormControl fullWidth error={!!errors[name]} sx={sx}>
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
                labelId={labelId}
                label={label}
                defaultValue=""
                value={value}
                {...register(name)}
            >
                {loginUsers.map((login_user) => (
                    <MenuItem key={login_user.id} value={login_user.id}>
                        {login_user.name} ({login_user.email})
                    </MenuItem>
                ))}
            </Select>
            {errors[name]?.message && (
                <FormHelperText>{String(errors[name]?.message)}</FormHelperText>
            )}
        </FormControl>
    );
}
