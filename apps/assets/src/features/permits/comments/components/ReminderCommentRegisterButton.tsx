"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { PermitCommentFormDialog } from "./PermitCommentFormDialog";

export function ReminderCommentRegisterButton({
    reminderId,
}: {
    reminderId: string;
}) {
    const [open, setOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);

    const handleOpen = () => {
        setFormKey((prev) => prev + 1);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <Button variant="outlined" onClick={() => handleOpen()} size="small">
            {/* <Button variant="outlined" onClick={() => handleOpen()}> */}
                コメントを登録
            </Button>

            <PermitCommentFormDialog
                open={open}
                onClose={() => handleClose()}
                targetType="reminder"
                targetId={reminderId}
                sourceType="detail"
                // defaultCommentTypeCode="memo"
                formKey={formKey}
            />
        </>
    );
}
