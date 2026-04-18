"use client";

import { useState } from "react";

import { useAuth } from "@contexts/AuthContext";
import { createClient } from "@supabase-shared/client";

import {
    Button,
    Tooltip,
    IconButton,
    Zoom
} from "@mui/material";

import LogoutIcon from '@mui/icons-material/Logout';

import DialogConfirm from "@ui/dialogs/DialogConfirm";

export default function LogoutButton({
    mobile=false,
}: {
    mobile?: boolean
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();

        sessionStorage.removeItem("selectedStaffId");
        // sessionStorage.clear();
    };

    const { user } = useAuth();

    return (
        <>
            <Tooltip
                arrow
                title="ログアウト"
                slots={{
                    transition: Zoom,
                }}
                slotProps={{
                    tooltip: {
                        sx: {
                            fontWeight: '700',
                            bgcolor: "error.main",
                            '& .MuiTooltip-arrow': {
                                color: "error.main",
                            },
                        },
                    },
                }}
                >
                {mobile ? (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={confirmOpen ? () => setConfirmOpen(false) : () => setConfirmOpen(true)}
                        sx={{
                            py: 1,
                            width: "100%"
                        }}
                        startIcon={<LogoutIcon />}
                        >
                        ログアウト
                    </Button>
                ) : (
                    <IconButton
                        onClick={confirmOpen ? () => setConfirmOpen(false) : () => setConfirmOpen(true)}
                        color="error"
                        >
                        <LogoutIcon />
                    </IconButton>
                )}
            </Tooltip>
            <DialogConfirm
                isOpen={confirmOpen}
                onDone={handleLogout}
                title={`${user?.email} をログアウトしますか？`}
                color="error"
                okText="ログアウト"
                onCancel={() => setConfirmOpen(false)}
                />
        </>
    );
}
