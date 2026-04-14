"use client";
import Link from "next/link";

import {
    Button,
    IconButton,
    Tooltip,
    Zoom,
} from "@mui/material";
import HelpIcon from '@mui/icons-material/Help';

export default function HelpButton({
    mobile=false,
}: {
    mobile?: boolean
}) {
    return (
        <Link
            href={`/help`}
            passHref
            >
            <Tooltip
                title="ヘルプ"
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
                        startIcon={<HelpIcon />}
                        >
                        ヘルプ
                    </Button>
                ) : (
                    <IconButton>
                        <HelpIcon />
                    </IconButton>
                )}
            </Tooltip>
        </Link>
    );
}
