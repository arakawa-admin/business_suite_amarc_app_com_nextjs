"use client";
import Link from "next/link";

import { usePathname, useSearchParams } from "next/navigation";

import {
    Button,
    IconButton,
    Tooltip,
    Zoom,
} from "@mui/material";

import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

export default function SwitchActiveSystemButton({
    mobile=false,
}: {
    mobile?: boolean
}) {
    const pathname = usePathname();
    const sp = useSearchParams();

    const qs = sp.toString();
    const returnTo = `${pathname}${qs ? `?${qs}` : ""}`;
    const href = `/select/active-system${returnTo && `?returnTo=${encodeURIComponent(returnTo)}`}`;

    return (
        <Link
            href={href}
            passHref
            >
            <Tooltip
                title="システム切替"
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
                        システム切替
                    </Button>
                ) : (
                    <IconButton>
                        <ChangeCircleIcon />
                    </IconButton>
                )}
            </Tooltip>
        </Link>
    );
}
