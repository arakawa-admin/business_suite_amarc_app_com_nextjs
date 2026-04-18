"use client";

import React from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    Typography,
    Button,
    Box,
    IconButton,
    Toolbar,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import DialogConfirm from "./DialogConfirm";

type DialogFormColor =
    | "error"
    | "inherit"
    | "warning"
    | "primary"
    | "secondary"
    | "success"
    | "info";

export type DialogFormProps = {
    isOpen: boolean;
    title: string;

    subtitle?: string;
    modeLabel?: string;
    color?: DialogFormColor;

    minimizable?: boolean;
    confirmBeforeClose?: boolean;
    isDirty?: boolean;

    onClose: () => void;
    onMinimize?: () => void;

    children: React.ReactNode;
    footer?: React.ReactNode;

    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
    fullScreenOnMobile?: boolean;

    closeConfirmText?: string;
    closeConfirmOkText?: string;
};

export default function DialogForm({
    isOpen,
    title,
    subtitle,
    modeLabel,
    color = "primary",
    minimizable = false,
    confirmBeforeClose = true,
    isDirty = false,
    onClose,
    onMinimize,
    children,
    footer,
    maxWidth = "lg",
    fullScreenOnMobile = true,
    closeConfirmText = "入力内容を破棄して閉じていいですか？",
    closeConfirmOkText = "OK",
}: DialogFormProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [confirmShut, setConfirmShut] = React.useState(false);

    const shouldFullScreen = fullScreenOnMobile ? fullScreen : false;

    const handleRequestClose = () => {
        if (confirmBeforeClose && isDirty) {
            setConfirmShut(true);
            return;
        }

        onClose();
    };

    const handleDialogClose = (_event: object, reason?: string) => {
        if (reason === "backdropClick") return;
        handleRequestClose();
    };

    const handleMinimize = () => {
        onMinimize?.();
    };

    const handleConfirmClose = () => {
        setConfirmShut(false);
        onClose();
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onClose={handleDialogClose}
                fullWidth
                maxWidth={maxWidth}
                fullScreen={shouldFullScreen}
                keepMounted
            >
                <Toolbar
                    sx={{
                        backgroundColor: `${color}.main`,
                    }}
                    >
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                            component="div"
                            sx={{
                                fontWeight: "bold",
                                px: 0,
                                color: "white",
                            }}
                        >
                            {title}
                            {modeLabel ? ` ${modeLabel}` : ""}
                        </Typography>

                        {subtitle ? (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "rgba(255,255,255,0.9)",
                                    mt: 0.25,
                                }}
                            >
                                {subtitle}
                            </Typography>
                        ) : null}
                    </Box>

                    <Box>
                        {minimizable ? (
                            <IconButton
                                size="small"
                                onClick={handleMinimize}
                                aria-label="minimize"
                            >
                                <MinimizeIcon sx={{ color: "white" }} />
                            </IconButton>
                        ) : null}

                        <IconButton
                            sx={{ color: "white" }}
                            onClick={handleRequestClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Toolbar>

                <DialogContent dividers sx={{ px: 0 }}>
                    {children}
                </DialogContent>

                <DialogActions>
                    {footer ?? (
                        <Button
                            onClick={handleRequestClose}
                            color="inherit"
                            size="large"
                            sx={{ width: "100%" }}
                            endIcon={<CloseIcon style={{ fontSize: "0.9em" }} />}
                        >
                            閉じる
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <DialogConfirm
                isOpen={confirmShut}
                onDone={handleConfirmClose}
                onCancel={() => setConfirmShut(false)}
                text={closeConfirmText}
                okText={closeConfirmOkText}
                color="warning"
            />
        </>
    );
}
