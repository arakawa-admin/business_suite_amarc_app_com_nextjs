"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { VehicleCommentFormDialog } from "./VehicleCommentFormDialog";

export function VehicleCommentRegisterButton({
    vehicleId,
}: {
    vehicleId: string;
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

            <VehicleCommentFormDialog
                open={open}
                onClose={() => handleClose()}
                targetType="vehicle"
                targetId={vehicleId}
                sourceType="detail"
                // defaultCommentTypeCode="memo"
                formKey={formKey}
            />
        </>
    );
}
