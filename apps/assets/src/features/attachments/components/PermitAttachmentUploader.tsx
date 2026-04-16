"use client";

import {
    AttachmentUploader,
} from "@ui/form/AttachmentUploader";
import type { UploadPreviewItem } from "@ui/form/file/types";
import type {
    AttachmentFormItem,
} from "../types/attachmentUiTypes";
import {
    toAttachmentPreviewItem,
} from "../types/attachmentUiTypes";

type Props = {
    value: AttachmentFormItem[];
    onChange: (next: AttachmentFormItem[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    accept?: string;
};

export function PermitAttachmentUploader({
    value,
    onChange,
    maxFiles,
    maxSizeMB,
    accept,
}: Props) {
    return (
        <AttachmentUploader<AttachmentFormItem>
            value={value}
            onChange={onChange}
            maxFiles={maxFiles}
            maxSizeMB={maxSizeMB}
            accept={accept}
            getId={(item) => item.attachmentId}
            getPreviewUrl={(item) => item.previewUrl}
            toPreviewItem={(item): UploadPreviewItem | null => {
                const preview = toAttachmentPreviewItem(item);
                if (!preview) {
                    return null;
                }

                return {
                    id: preview.id,
                    name: preview.name,
                    type: preview.type,
                    viewUrl: preview.viewUrl,
                    thumbnailUrl: preview.thumbnailUrl ?? null,
                };
            }}
            createItemFromUploadResult={(payload) => ({
                attachmentId: payload.attachmentId,
                originalFilename: payload.originalFilename,
                contentType: payload.contentType,
                byteSize: payload.byteSize,
                storageKey: payload.storageKey,
                thumbnailStorageKey: payload.thumbnailStorageKey,
                previewUrl: payload.previewUrl,
                viewUrl: payload.viewUrl,
                thumbnailViewUrl: payload.thumbnailViewUrl,
            })}
        />
    );
}
