"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
    Button,
} from "@mui/material";

import { FormDialogLauncher } from "@/components/common/buttons/FormDialogLauncher";

import ApprovalForm from "@/components/approval/forms/ApprovalForm";

export function ApprovalCreateButton({
    color = "success",
    sx,
}: {
    color?: "error" | "inherit" | "warning" | "primary" | "secondary" | "success" | "info";
    sx?: object;
}) {
    const { profile } = useAuth();
    const can = useMemo(() => {
        return Boolean(profile?.department?.code !== "viewer");
    }, [profile]);

    return (
        <FormDialogLauncher
            can={can}
            dialogTitle="稟議書"
            isCreate
            minimizable={false}
            renderTrigger={({ open }) => (
                <Button
                    color={color}
                    variant="contained"
                    onClick={open}
                    sx={sx}
                    className={`bg-gradient-to-br from-${color}-dark via-${color}-main to-${color}-light`}
                    size="large"
                >
                    起案する
                </Button>
            )}
            renderBody={({ close, registerReset }) => (
                <ApprovalForm
                    onSuccess={close}
                    registerReset={registerReset}
                    />
            )}
        />
    );
}

import { ApprovalUpdateInput } from "@/schemas/approval/approvalSchema";
export function ApprovalReSubmitButton({
    approvalItem,
    color = "warning",
    sx,
}: {
    approvalItem?: ApprovalUpdateInput
    color?: "error" | "inherit" | "warning" | "primary" | "secondary" | "success" | "info";
    sx?: object;
}) {
    return (
        <FormDialogLauncher
            dialogTitle="稟議書"
            isCreate={false}
            minimizable={false}
            renderTrigger={({ open }) => (
                <Button
                    color={color}
                    variant="contained"
                    onClick={open}
                    sx={sx}
                    className={`bg-gradient-to-br from-${color}-dark via-${color}-main to-${color}-light`}
                    size="large"
                >
                    改訂版を提出
                </Button>
            )}
            renderBody={({ close, registerReset }) => (
                <ApprovalForm
                    approvalItem={approvalItem}
                    onSuccess={close}
                    registerReset={registerReset}
                    />
            )}
        />
    );
}
