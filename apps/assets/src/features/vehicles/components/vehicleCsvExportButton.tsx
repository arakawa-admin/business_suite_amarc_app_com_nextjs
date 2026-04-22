"use client";

import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useSearchParams } from "next/navigation";

export function VehicleCsvExportButton() {
    const searchParams = useSearchParams();

    const handleClick = () => {
        const params = new URLSearchParams(searchParams.toString());
        const url = `/api/vehicles/export/csv?${params.toString()}`;
        window.location.href = url;
    };

    return (
        <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleClick}
        >
            CSV出力
        </Button>
    );
}
