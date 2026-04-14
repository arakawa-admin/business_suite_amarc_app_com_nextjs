"use client";

import { Button } from "@mui/material";

export default function FilePicker({
    label,
    onSelect,
    multiple,
    accept,
    inputRef,
    hasButton=false,
}: {
    label: string;
    multiple: boolean;
    accept?: string;
    onSelect: (files: File[]) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    hasButton?: boolean;
}) {
    return (
        hasButton
            ? <Button variant="outlined" component="label">
                {label}
                <input
                    hidden
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    ref={inputRef}
                    onChange={(e) =>
                        onSelect(Array.from(e.target.files ?? []))
                    }
                />
            </Button>
            : <input
                hidden
                type="file"
                multiple={multiple}
                accept={accept}
                ref={inputRef}
                onChange={(e) => {
                    onSelect(Array.from(e.target.files ?? []))
                    // ★これが無いと「同じファイル」を再選択しても onChange が発火しない
                    e.currentTarget.value = "";
                }}
            />
    );
}
