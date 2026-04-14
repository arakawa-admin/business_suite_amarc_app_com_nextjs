"use client";

import { useState } from "react";
import { IconButton, Tooltip, Zoom } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export function DeleteActionButton({
    title = "削除",
    can = true,
    disabled = false,
    onOpen,
    renderDialog,
}: {
    title?: string;
    can?: boolean;
    disabled?: boolean;
    animate?: boolean;
    onOpen?: () => void;
    renderDialog: (args: { open: boolean; onClose: () => void }) => React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    if (!can) return null;

    return (
        <>
            <Tooltip
                title={title}
                arrow
                placement="top"
                slots={{ transition: Zoom }}
                slotProps={{
                    tooltip: {
                        sx: {
                            fontWeight: "700",
                            bgcolor: "error.main",
                            "& .MuiTooltip-arrow": { color: "error.main" },
                        },
                    },
                }}
                >
                {/* disabledでもTooltipが効くようにspanでラップ */}
                <span>
                    <IconButton
                        onClick={() => {
                            onOpen?.();
                            setOpen(true);
                        }}
                        disabled={disabled}
                        >
                        <DeleteIcon sx={{ fontSize: "0.8em" }} color={disabled ? "disabled" : "error"} />
                    </IconButton>
                </span>
            </Tooltip>

            {renderDialog({ open, onClose: close })}
        </>
    );
}
