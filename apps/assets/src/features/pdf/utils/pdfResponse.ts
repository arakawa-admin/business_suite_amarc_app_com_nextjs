import React from "react";
import { renderToStream } from "@react-pdf/renderer";

export async function createPdfDownloadResponse({
    document,
    fileName,
}: {
    document: React.ReactElement;
    fileName: string;
}) {
    const stream = await renderToStream(document as Parameters<typeof renderToStream>[0]);

    return new Response(stream as unknown as ReadableStream, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Cache-Control": "no-store",
        },
    });
}
