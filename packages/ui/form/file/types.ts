export type UploadPreviewItem = {
    id: string;
    name: string;
    type: "image" | "pdf";
    viewUrl: string;
    thumbnailUrl?: string | null;
};

export type UploadedFilePayload = {
    attachmentId: string;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;
    storageKey: string | null;
    thumbnailStorageKey: string | null;
    previewUrl: string | null;
    viewUrl: string | null;
    thumbnailViewUrl: string | null;
};
