"use client";

import { Button } from "@mui/material";
import MoveDownIcon from '@mui/icons-material/MoveDown';

export function ApproveFlowButton() {
    return (
        <Button
            // href="/approval/flow"
            color="success"
            variant="outlined"
            sx={{
                py: 2,
                width: "100%",
                minHeight: "5rem",
                fontSize: "1.25rem",
                borderRadius: 4,
            }}
            size="large"
            startIcon={<MoveDownIcon />}
            >
            承認フロー
        </Button>
    );
}
