"use client";

import * as React from "react";
import { Box, Paper, Typography } from "@mui/material";

type DetailValue = string | string[] | React.ReactNode | null | undefined;

const isStringArray = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string");

export default function DetailSection({
    title,
    value,
}: {
    title: string;
    value: DetailValue;
}) {
    if (value == null || value === false) return null;

    // ✅ string / string[] のときだけ整形して Typography で描画
    if (typeof value === "string" || isStringArray(value)) {
        const items: string[] =
            typeof value === "string"
                ? value.split("。").map((v) => v.trim()).filter(Boolean)
                : value.map((v) => v.trim()).filter(Boolean);

        if (items.length === 0) return null;

        return (
            <Box>
                <Typography variant="body2" sx={{ color: "text.secondary", m: 0.5 }}>
                    {title}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    {items.map((v, i) => (
                        <Typography
                            key={i}
                            variant="body2"
                            sx={{
                                ...(items.length > 1 && { p: 1, borderBottom: "1px solid #ddd" }),
                            }}
                        >
                            {v}
                        </Typography>
                    ))}
                </Paper>
            </Box>
        );
    }

    // ✅ それ以外（ReactNode / ReactNode[] 含む）はそのまま描画
    return (
        <Box>
            <Typography variant="body2" sx={{ color: "text.secondary", m: 0.5 }}>
                {title}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                {value}
            </Paper>
        </Box>
    );
}
