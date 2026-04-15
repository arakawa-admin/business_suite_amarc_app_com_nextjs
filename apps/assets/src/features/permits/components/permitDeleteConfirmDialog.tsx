"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import { softDeletePermitAction } from "../actions/permitDeleteActions";
import type { PermitDetailRow } from "../types/permitTypes";
import DeleteIcon from '@mui/icons-material/Delete';

export function PermitDeleteConfirmDialog({
    permit,
}: {
    permit: PermitDetailRow
}) {
    const [open, setOpen] = useState(false);
    const onClose = () => setOpen(false);
    const router = useRouter();

    const handleDone = async () => {
        try {
            const result = await softDeletePermitAction({
                permitId: permit.id,
                deleteReason: permit.delete_reason ?? ""
            });
            toast.success(result.message);
            router.push("/permits");
        } catch {
            toast.error("許認可の削除に失敗しました");
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
                title={`"${permit.permit_number}"の削除`}
                text={"削除すると通常一覧には表示されなくなります。必要に応じて後から復元できます。"}
                okText={"削除する"}
                color="error"
            />
        </>
    );
}
