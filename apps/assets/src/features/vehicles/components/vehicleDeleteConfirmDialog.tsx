"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import DialogConfirm from "@ui/dialogs/DialogConfirm";

import { softDeleteVehicleAction } from "../actions/vehicleDeleteActions";
import type { VehicleDetailItem } from "../types/vehicleTypes";
import DeleteIcon from '@mui/icons-material/Delete';

export function VehicleDeleteConfirmDialog({
    vehicle,
}: {
    vehicle: VehicleDetailItem
}) {
    const [open, setOpen] = useState(false);
    const onClose = () => setOpen(false);
    const router = useRouter();

    const handleDone = async () => {
        try {
            const result = await softDeleteVehicleAction({
                vehicleId: vehicle.id,
                deleteReason: vehicle.delete_reason ?? ""
            });
            toast.success(result.message);
            router.push("/vehicles");
        } catch {
            toast.error("車両の削除に失敗しました");
        } finally {
            onClose();
        }
    };

    return (
        <>
            <Button
                color="error"
                onClick={() => setOpen(true)}
                size="small"
                startIcon={<DeleteIcon />}
                >
                削除
            </Button>
            <DialogConfirm
                isOpen={open}
                onDone={handleDone}
                onCancel={onClose}
                title={`"${vehicle.registration_number}"の削除`}
                text={"削除すると通常一覧には表示されなくなります。必要に応じて後から復元できます。"}
                okText={"削除する"}
                color="error"
            />
        </>
    );
}
