"use client";

import { useState, useEffect } from "react";

import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Toolbar,
} from "@mui/material";

export default function DialogConfirm({
    isOpen = false,
    onDone,
    onCancel,
    title,
    color = "primary",
    text,
    okText = "OK",
    formId,
    okButtonType = "button",
}: {
    isOpen?: boolean;
    onDone: () => void;
    onCancel?: () => void;
    title?: string;
    color?: "error" | "inherit" | "warning" | "primary" | "secondary" | "success" | "info";
    text?: string;
    okText: string;
    formId?: string;
    okButtonType?: "button" | "submit";
}) {
    const [confirmOpen, setConfirmOpen] = useState(isOpen);
    useEffect(() => { setConfirmOpen(isOpen); }, [isOpen]);

    const handleConfirmCloseDialog = () => {
        setConfirmOpen(false);
    };

    const handleDone = async() => {
        setConfirmOpen(false);
        onDone();
    }
    const handleCancel = async() => {
        setConfirmOpen(false);
        onCancel?.();
    }

    return (
        <Dialog
            open={confirmOpen}
            onClose={(_, reason) => {
                if (reason !== "backdropClick") {
                    handleConfirmCloseDialog();
                }
            }}
            fullWidth
            maxWidth="sm"
            >
            <Toolbar
                variant="dense"
                color={color}
                sx={{
                    backgroundColor: color ? `${color}.main` : "primary.main",
                    color: "white",
                    fontWeight: "bold",
                }}
                >
                確認
            </Toolbar>

            {title ? (
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    {title}
                </DialogTitle>
            ) : null}

            {text ? (
                <DialogContent>
                    <DialogContentText>{text}</DialogContentText>
                </DialogContent>
            ) : null}

            <DialogActions
                sx={{ borderTop: '1px solid #ccc' }}
                >
                <Button
                    color="inherit"
                    sx={{ p: 1, flexGrow: 1, fontSize: '1.2em' }}
                    onClick={handleCancel}
                    >
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    className={`bg-gradient-to-br from-${color ?? "primary"}-dark via-${color ?? "primary"}-main to-${color ?? "primary"}-light`}
                    sx={{ p: 1, fontWeight: 'bold', fontSize: '1.2em', flexGrow: 1 }}
                    color={color}
                    type={okButtonType}
                    form={formId}
                    onClick={okButtonType === "button" ? handleDone : undefined}
                    >
                    {okText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
