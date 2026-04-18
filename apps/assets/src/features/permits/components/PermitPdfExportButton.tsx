"use client";
import { Button } from "@mui/material";

export function PermitPdfListExportButton() {
    return (
        <Button
            component="a"
            href="/api/permits/export/pdf/list"
            variant="outlined"
            >
            一覧PDF
        </Button>
    );
}


export function PermitPdfDetailExportButton({ id }: { id: string }) {
    return (
        <Button
            component="a"
            href={`/api/permits/export/pdf/detail/${id}`}
            variant="outlined"
            >
            詳細PDF
        </Button>
    );
}


export function PermitPdfFormExportButton({ id }: { id: string }) {
    return (
        <Button
            component="a"
            href={`/api/permits/export/pdf/form/${id}`}
            variant="outlined"
            >
            帳票PDF
        </Button>
    );
}
