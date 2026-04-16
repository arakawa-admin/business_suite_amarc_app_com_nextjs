export type AttachmentFormItem = {
    attachmentId: string;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;

    storageKey?: string | null;
    thumbnailStorageKey?: string | null;

    previewUrl?: string | null;
    viewUrl?: string | null;
    thumbnailViewUrl?: string | null;
};

export type AttachmentPreviewItem = {
    id: string;
    name: string;
    type: "image" | "pdf";
    viewUrl: string;
    thumbnailUrl: string | null;
};

export function resolveAttachmentPreviewType(
    contentType: string | null,
): "image" | "pdf" {
    if (contentType?.includes("pdf")) {
        return "pdf";
    }

    return "image";
}

export function toAttachmentPreviewItem(
    item: AttachmentFormItem,
): AttachmentPreviewItem | null {
    const resolvedUrl = item.previewUrl || item.viewUrl || null;
    const resolvedThumbnailUrl =
        item.previewUrl || item.thumbnailViewUrl || item.viewUrl || null;

    if (!resolvedUrl) {
        return null;
    }

    return {
        id: item.attachmentId,
        name: item.originalFilename,
        type: resolveAttachmentPreviewType(item.contentType),
        viewUrl: resolvedUrl,
        thumbnailUrl: resolvedThumbnailUrl,
    };
}

export function toAttachmentPreviewItems(
    items: AttachmentFormItem[],
): AttachmentPreviewItem[] {
    return items
        .map(toAttachmentPreviewItem)
        .filter((item): item is AttachmentPreviewItem => item !== null);
}
