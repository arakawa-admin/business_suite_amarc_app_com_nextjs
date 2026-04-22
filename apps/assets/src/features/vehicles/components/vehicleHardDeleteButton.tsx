"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Stack } from "@mui/material";
import {
    checkVehicleHardDeleteAction,
    hardDeleteVehicleAction,
} from "../actions/vehicleDeleteActions";

export function VehicleHardDeleteButton({
    vehicleId,
}: {
    vehicleId: string;
}) {
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        const ok = window.confirm(
            "この車両を完全削除します。元に戻せません。よろしいですか？",
        );
        if (!ok) return;

        startTransition(async () => {
            const check = await checkVehicleHardDeleteAction(vehicleId);

            if (!check.ok || !check.canHardDelete) {
                setMessage(check.message);
                return;
            }

            await hardDeleteVehicleAction(vehicleId);
        });
    };

    return (
        <Stack spacing={1}>
            {message && <Alert severity="warning">{message}</Alert>}
            <Button
                color="error"
                variant="outlined"
                disabled={isPending}
                onClick={handleClick}
            >
                完全削除
            </Button>
        </Stack>
    );
}
