"use client";

import { useRef, useState, useEffect } from "react";

import { Box } from "@mui/material";

import "@/lib/pdfWorker";
import { Document, Page, 
    // pdfjs
} from "react-pdf";

export default function PdfPreview({
    file,
    maxHeight = undefined
}: {
    file: File,
    maxHeight?: number|undefined
}) {

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const [error, setError] = useState<string | null>(null);

    return (
        <Box
            ref={containerRef}
            sx={{
                maxHeight: maxHeight,
                objectFit: "cover",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            >
            {!!file &&
                <Document
                    file={file}
                    onLoadError={(err) => {
                        console.error("PDF Load Error:", err.message);
                        setError(err.message);
                    }}
                    >
                    <Page
                        pageNumber={1}
                        width={width}
                        // width={200}
                        />
                    {error && <div style={{ color: "red" }}>PDF読み込みエラー: {error}</div>}
                </Document>
            }
        </Box>
    );
}
