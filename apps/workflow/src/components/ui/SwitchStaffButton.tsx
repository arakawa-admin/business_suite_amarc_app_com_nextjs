"use client";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useSearchParams } from "next/navigation";

import {
    Button,
    IconButton,
    Tooltip,
    Zoom,
} from "@mui/material";

import SwitchIcon from '@mui/icons-material/SwitchAccount';

export default function SwitchStaffButton({
    mobile=false,
}: {
    mobile?: boolean
}) {
    const pathname = usePathname();
    const sp = useSearchParams();

    const qs = sp.toString();
    const returnTo = `${pathname}${qs ? `?${qs}` : ""}`;
    const href = returnTo
        ? `/select/staff?returnTo=${encodeURIComponent(returnTo)}`
        : "/select/staff";

    const { user } = useAuth();
    if(user?.staffs.length==1) return null;

    return (
        <Link
            href={href}
            passHref
            >
            <Tooltip
                title="ユーザ切替"
                arrow
                slots={{
                    transition: Zoom,
                }}
                >
                {mobile ? (
                    <Button
                        variant="contained"
                        color="inherit"
                        sx={{
                            py: 1,
                            width: "100%"
                        }}
                        >
                        ユーザ切替
                    </Button>
                ) : (
                    <IconButton>
                        <SwitchIcon />
                    </IconButton>
                )}
            </Tooltip>
        </Link>
    );
}
