"use client";

import { Paper, Typography, Stack } from "@mui/material";
import { useState } from "react";
import FileUploadIcon from '@mui/icons-material/FileUpload';

type DropZoneProps = {
    onDropFiles: (files: File[]) => void;
    onClickOpen?: () => void;
    disabled?: boolean;
};

export default function DropZone({
    onDropFiles,
    onClickOpen,
    disabled=false,
}: DropZoneProps) {
    const [hover, setHover] = useState(false);

    return (
        <Paper
            variant="outlined"
            onClick={() => {
                if(disabled) return;
                onClickOpen?.()
            }}
            onDragOver={(e) => {
                if(disabled) return;
                e.preventDefault();
                setHover(true);
            }}
            onDragLeave={() => setHover(false)}
            onDrop={(e) => {
                if(disabled) return;
                e.preventDefault();
                setHover(false);
                onDropFiles(Array.from(e.dataTransfer.files));
            }}
            sx={ (theme) => ({
                p: 3,
                border: `3px dashed ${disabled ? theme.palette.secondary.main : theme.palette.primary.main}`,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: hover ? "#e3f2fd" : "#fafafa",
                transition: "0.2s",
                cursor: "pointer",
            })}
            >
            <FileUploadIcon sx={{ fontSize: 48 }} color={disabled ? "secondary" : "primary"} />
            <Stack>
                {disabled
                    ? <>
                    <Typography color={disabled ? "secondary" : "primary"}>上限に達しました</Typography>
                    <Typography color={disabled ? "secondary" : "primary"} sx={{ fontSize: "0.8rem" }}>アップロード不可</Typography>
                    </>
                    : <>
                    <Typography color={disabled ? "secondary" : "primary"}>クリックしてアップロード</Typography>
                    <Typography color={disabled ? "secondary" : "primary"} sx={{ fontSize: "0.8rem" }}>ここにファイルをドロップ</Typography>
                    </>
                }
            </Stack>
        </Paper>
    );
}
