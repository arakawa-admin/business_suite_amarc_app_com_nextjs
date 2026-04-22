"use client";
import { Button } from "@mui/material";

export function VehiclePdfListExportButton() {
    return (
        <Button
            component="a"
            href="/api/vehicles/export/pdf/list"
            variant="outlined"
            >
            一覧PDF
        </Button>
    );
}


export function VehiclePdfDetailExportButton({ id }: { id: string }) {
    return (
        <Button
            component="a"
            href={`/api/vehicles/export/pdf/detail/${id}`}
            variant="outlined"
            >
            詳細PDF
        </Button>
    );
}


export function VehiclePdfFormExportButton({ id }: { id: string }) {
    return (
        <Button
            component="a"
            href={`/api/vehicles/export/pdf/form/${id}`}
            variant="outlined"
            >
            帳票PDF
        </Button>
    );
}
