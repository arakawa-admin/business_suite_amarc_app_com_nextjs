"use client";

import { Button } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

export function ApprovalSearchButton() {
    return (
        <Button
            // href="/approval/search"
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
            startIcon={<SearchIcon />}
            >
            検索
        </Button>
    );
}
