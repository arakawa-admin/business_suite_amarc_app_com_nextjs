declare module "pdfjs-dist/build/pdf" {
    export interface PDFDocumentProxy {
        numPages: number;
        getPage(pageNumber: number): Promise<any>;
    }

    export const GlobalWorkerOptions: {
        workerSrc: string;
    };

    export function getDocument(src: unknown): {
        promise: Promise<PDFDocumentProxy>;
    };
}
