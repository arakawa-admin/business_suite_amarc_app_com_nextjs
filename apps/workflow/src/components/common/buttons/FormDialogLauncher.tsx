"use client";

import { useRef, useCallback, useState } from "react";
import DialogForm from "@/components/common/dialogs/DialogForm";

export function FormDialogLauncher({
    can = true,
    disabled = false,
    dialogTitle,
    isCreate = true,
    minimizable = false,
    renderTrigger,
    renderBody,
}: {
    can?: boolean;
    disabled?: boolean;
    dialogTitle: string;
    isCreate?: boolean;
    minimizable?: boolean;
    renderTrigger: (args: { open: () => void; disabled: boolean }) => React.ReactNode;
    renderBody: (args: {
        close: () => void;
        registerReset: (fn: () => void) => void;
    }) => React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    const resetRef = useRef<(() => void) | null>(null);
    const registerReset = useCallback((fn: () => void) => {
        resetRef.current = fn; // setStateしない
    }, []);

    const openDialog = () => setOpen(true);
    const closeDialog = () => {
        resetRef.current?.();
        setOpen(false);
    }

    if (!can) return null;

    return (
        <>
            {renderTrigger({ open: openDialog, disabled })}
            {open && (
                <DialogForm
                    isOpen={open}
                    title={dialogTitle}
                    isCreate={isCreate}
                    onClose={closeDialog}
                    minimizable={minimizable}
                    >
                    {renderBody({ close: closeDialog, registerReset })}
                </DialogForm>
            )}
        </>
    );
}
