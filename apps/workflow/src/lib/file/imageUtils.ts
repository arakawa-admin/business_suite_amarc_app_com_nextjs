'use server'

import sharp from "sharp";
// import { getDocument } from "pdfjs-dist";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import { createCanvas } from "canvas";

// 👇 Workerを無効化（必須）
GlobalWorkerOptions.workerSrc = "";

interface ThumbnailOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
}

const DEFAULT_OPTIONS: Required<ThumbnailOptions> = {
    width: 300,
    height: 300,
    quality: 80,
    format: "jpeg",
};

export async function generateThumbnail(
    fileBuffer: Buffer,
    mime: string
): Promise<{
    buffer: Buffer;
    contentType: string;
    width: number;
    height: number;
    size: number;
}> {
    // =============================
    // ① PDF の場合
    // =============================
    if (mime === "application/pdf") {
        const buf = await generatePdfThumbnail(fileBuffer, DEFAULT_OPTIONS);
        const meta = await sharp(buf).metadata();
        return {
            buffer: buf,
            contentType: "image/png",
            width: meta.width ?? DEFAULT_OPTIONS.width,
            height: meta.height ?? DEFAULT_OPTIONS.height,
            size: buf.length,
        };
    }

    // =============================
    // ② 画像（JPEG/PNG/WEBP/GIF/BMP）
    // =============================
    if (mime.startsWith("image/")) {
        const buf = await generateImageThumbnail(fileBuffer, DEFAULT_OPTIONS);
        const meta = await sharp(buf).metadata();
        return {
            buffer: buf,
            contentType: "image/png",
            width: meta.width ?? DEFAULT_OPTIONS.width,
            height: meta.height ?? DEFAULT_OPTIONS.height,
            size: buf.length,
        };
    }

    throw new Error(`Unsupported MIME type: ${mime}`);
}

export async function generatePdfThumbnail(
    pdfBuffer: Buffer,
    options: Required<ThumbnailOptions>
): Promise<Buffer> {
    const arrayBuffer = pdfBuffer.buffer.slice(
        pdfBuffer.byteOffset,
        pdfBuffer.byteOffset + pdfBuffer.byteLength
    );
    type PdfJsData = Uint8Array | ArrayBuffer;
    const loadingTask = getDocument({ data: arrayBuffer as PdfJsData });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
    }).promise;

    const imageBuffer = canvas.toBuffer("image/png");

    return sharp(imageBuffer)
        .resize(options.width, options.height, {
            fit: "inside",
            withoutEnlargement: true,
        })
        .toFormat(options.format, { quality: options.quality })
        .toBuffer();
}


export async function generateImageThumbnail(
    buffer: Buffer,
    options: Required<ThumbnailOptions>
): Promise<Buffer> {
    return sharp(buffer, { pages: 1 }) // GIF は先頭フレームのみ
        .resize(options.width, options.height, {
            fit: "inside",
            withoutEnlargement: true,
        })
        .toFormat(options.format, { quality: options.quality })
        .toBuffer();
}
