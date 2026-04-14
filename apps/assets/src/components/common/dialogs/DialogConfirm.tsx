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
}: {
    isOpen?: boolean;
    onDone: () => void;
    onCancel?: () => void;
    title?: string;
    color?: "error" | "inherit" | "warning" | "primary" | "secondary" | "success" | "info";
    text?: string;
    okText: string;
}) {
    const [confirmOpen, setConfirmOpen] = useState(isOpen);
    useEffect(() => { setConfirmOpen(isOpen); }, [isOpen]);


    const handleConfirmCloseDialog = (event: React.MouseEvent<HTMLButtonElement>, reason?: string) => {
        if (reason !== 'backdropClick') {
            setConfirmOpen(false);
        }
    };

    const handleDone = async() => {
        setConfirmOpen(false);
        onDone();
    }
    const handleCancel = async() => {
        setConfirmOpen(false);
        if (onCancel) { onCancel(); }
    }

    return (
        <Dialog
            open={confirmOpen}
            onClose={handleConfirmCloseDialog}
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

            {title && title !== "" && (
                <DialogTitle
                    sx={{
                        fontWeight: 'bold',
                    }}
                    >
                    {title}
                </DialogTitle>
            )}
            {text && text !== "" && (
                <DialogContent>
                    <DialogContentText>
                        {text}
                    </DialogContentText>
                </DialogContent>
            )}
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
                    onClick={handleDone}
                    color={color}
                    >
                    {okText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
