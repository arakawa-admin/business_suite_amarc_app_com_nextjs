"use client";

import { Button } from "@mui/material";

import BookmarkIcon from '@mui/icons-material/Bookmark';

export function OldApprovalListButton() {
    return (
        <Button
            href="https://approval.amarc.co.jp/"
            target="_blank"
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
            startIcon={<BookmarkIcon />}
            >
            過去稟議
        </Button>
    );
}
