"use client";

import { Box, Skeleton } from "@mui/material";

export default function LoadingScreen({
    width,
    height
}:{
    width?: string;
    height?: string
}) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: `${height ?? "100vh"}`,
                my: 2
            }}
        >
            <Skeleton
                animation="wave"
                variant="rectangular"
                width={width ?? "90%"}
                height={height ?? "90%"}
            />
        </Box>
    );
}
