"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { PermitCommentFormDialog } from "./PermitCommentFormDialog";

export function PermitCommentRegisterButton({
    permitId,
}: {
    permitId: string;
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
            <Button variant="outlined" onClick={() => handleOpen()}>
                コメントを登録
            </Button>

            <PermitCommentFormDialog
                open={open}
                onClose={() => handleClose()}
                targetType="permit"
                targetId={permitId}
                sourceType="detail"
                // defaultCommentTypeCode="memo"
                formKey={formKey}
            />
        </>
    );
}
