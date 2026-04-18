"use client";

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Typography } from "@mui/material";

function prettyJson(value: unknown): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return "";
    }
}

export function AuditLogMetadataDialog({
    open,
    onClose,
    metadata,
}: {
    open: boolean;
    onClose: () => void;
    metadata: Record<string, unknown> | null;
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle sx={{ fontWeight: "bold" }}>
                補助情報の詳細
            </DialogTitle>

            <DialogContent dividers>
                {metadata ? (
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 2,
                            bgcolor: "grey.100",
                            borderRadius: 1,
                            fontSize: 13,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflowX: "auto",
                        }}
                    >
                        {prettyJson(metadata)}
                    </Box>
                ) : (
                    <Typography color="text.secondary">
                        補助情報はありません。
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
    );
}
