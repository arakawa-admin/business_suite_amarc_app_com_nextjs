"use client";

import { ReactNode } from "react";
import {
    Alert,
    // AlertTitle,
    Box,
    Checkbox,
    FormControlLabel,
    FormHelperText,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
    /** react-hook-form のフィールド名。例: "agreeTerms" */
    name: string;
    /** タイトル（任意） */
    // title?: string;
    /** チェックボックスのラベル（任意） */
    checkboxLabel?: string;
    /** 無効化（任意） */
    disabled?: boolean;
    /** Alert の severity */
    severity?: "info" | "warning" | "error" | "success";
    /** 規約文など */
    children: ReactNode;
};

export default function AgreeField({
    name,
    // title = "確認",
    checkboxLabel = "上記に同意します",
    disabled = false,
    severity = "info",
    children,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const message =
        (errors as any)?.[name]?.message as string | undefined;

    return (
        <Alert
            icon={false}
            severity={message ? "error" : severity}
            variant="outlined"
            sx={{ borderRadius: 2 }}
            >
            {/* {title && <AlertTitle>{title}</AlertTitle>} */}

            {/* 規約本文 */}
            <Box sx={{ mb: 1, color: "text.primary" }}>
                {children}
            </Box>

            {/* チェックボックス */}
            <Box sx={{ px: 2 }}>
                <Controller
                    name={name}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!field.value}
                                    onChange={(_, checked) => field.onChange(checked)}
                                    disabled={disabled}
                                />
                            }
                            label={checkboxLabel}
                        />
                    )}
                />

                {/* エラーメッセージ */}
                {message && <FormHelperText error>{message}</FormHelperText>}
            </Box>
        </Alert>
    );
}
