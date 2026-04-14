"use client";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import {
    Button,
    IconButton,
    Tooltip,
    Zoom,
} from "@mui/material";

import SettingsIcon from '@mui/icons-material/Settings';

export default function AdminButton({
    mobile=false,
}: {
    mobile?: boolean
}) {
    const { user } = useAuth();
    if(!user?.is_admin) return null;

    return (
        <Link
            href={`/admin`}
            passHref
            >
            <Tooltip
                title="管理者ページ"
                arrow
                slots={{
                    transition: Zoom,
                }}
                slotProps={{
                    tooltip: {
                        sx: {
                            fontWeight: '700',
                            bgcolor: "secondary.main",
                            '& .MuiTooltip-arrow': {
                                color: "secondary.main",
                            },
                        },
                    },
                }}
                >
                {mobile ? (
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{
                            py: 1,
                            width: "100%"
                        }}
                        startIcon={<SettingsIcon />}
                        >
                        管理者ページ
                    </Button>
                ) : (
                    <IconButton color="secondary">
                        <SettingsIcon />
                    </IconButton>
                )}
            </Tooltip>
        </Link>
    );
}
