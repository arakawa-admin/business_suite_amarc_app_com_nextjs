"use client";

import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";

export interface ThumbnailOptions {
    pageNumber?: number;
    scale?: number;
    format?: "image/png" | "image/jpeg" | "image/webp";
    quality?: number;
}

/* =========================================
    PDFJS (pdfjs-dist) を動的に読み込む
========================================= */
async function loadPdfJs() {
    if (typeof window === "undefined") {
        // サーバ実行時は PDF を処理しない
        throw new Error("PDF processing is only available in the browser.");
    }

    const pdfjs = await import("pdfjs-dist");

    // Worker の URL を直接指定
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    return pdfjs;
}

/**
 * PDF 1ページ目などを DataURL に変換
 */
export async function generatePdfThumbnail(
    file: File | Blob,
    options: ThumbnailOptions = {},
): Promise<string> {
    const {
        pageNumber = 1,
        scale = 1.5,
        format = "image/png",
        quality = 0.92,
    } = options;

    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Canvas context could not be created");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    return canvas.toDataURL(format, quality);
}

/**
 * 既存 canvas に PDF サムネを描画して DataURL を返す
 */
export async function generatePdfThumbnailToCanvas(
    file: File | Blob,
    canvas: HTMLCanvasElement,
    options: ThumbnailOptions = {},
): Promise<string> {
    const {
        pageNumber = 1,
        scale = 1.5,
        format = "image/png",
        quality = 0.92,
    } = options;

    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Canvas context could not be created");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    return canvas.toDataURL(format, quality);
}

/**
 * PDF 全ページのサムネを DataURL 配列で返す
 */
export async function generateAllPdfThumbnails(
    file: File | Blob,
    options: Omit<ThumbnailOptions, "pageNumber"> = {},
): Promise<string[]> {
    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    const thumbnails: string[] = [];
    for (let i = 1; i <= pdf.numPages; i += 1) {
        const url = await generatePdfThumbnail(file, {
            ...options,
            pageNumber: i,
        });
        thumbnails.push(url);
    }

    return thumbnails;
}

/**
 * PDF の基本情報
 */
export async function getPdfInfo(file: File | Blob) {
    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    return {
        numPages: pdf.numPages,
    };
}

/**
 * 画像圧縮
 */
export async function compressImage(file: File): Promise<File> {
    const result = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
    });

    return new File([result], file.name, { type: result.type });
}

/**
 * 画像サムネを File で返す
 */
export async function generateImageThumb(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const width = 400;
            const scale = width / img.width;

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error("Canvas Error"));
                return;
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);

                if (!blob) {
                    reject(new Error("Blob Error"));
                    return;
                }

                resolve(
                    new File([blob], `${file.name}.thumb.png`, {
                        type: "image/png",
                    }),
                );
            }, "image/png");
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Image load error"));
        };

        img.src = url;
    });
}

/**
 * PDF 圧縮
 */
export async function compressPdf(file: File): Promise<File> {
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);

    const compressed = await pdfDoc.save({
        addDefaultPage: false,
        useObjectStreams: true,
    });

    return new File([compressed as unknown as BlobPart], file.name, {
        type: "application/pdf",
    });
}

/**
 * PDF の1ページ目サムネを File で返す
 */
export async function generatePdfThumb(file: File): Promise<File> {
    const pdfjs = await loadPdfJs();
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas error");
    }

    canvas.width = 400;
    canvas.height = (400 / viewport.width) * viewport.height;

    const renderContext = {
        canvasContext: ctx,
        viewport: page.getViewport({ scale: canvas.width / viewport.width }),
    };

    await page.render(renderContext).promise;

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Blob Error"));
                return;
            }

            resolve(
                new File(
                    [blob],
                    file.name.replace(/\\.pdf$/i, "") + ".thumb.png",
                    { type: "image/png" },
                ),
            );
        }, "image/png");
    });
}
