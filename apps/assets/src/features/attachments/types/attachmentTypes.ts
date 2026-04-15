import type {
    AssetTargetType,
    AttachmentRole,
} from "@/features/shared/types/assetsDomainTypes";

export type Attachment = {
    id: string;
    storageBucket: string;
    storageKey: string;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;
    sha256: string | null;
    remarks: string | null;
    linkedAt: string | null;
    uploadedBy: string | null;
    uploadedAt: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    deletedBy: string | null;
};

export type AttachmentLink = {
    id: string;
    attachmentId: string;
    targetType: AssetTargetType;
    targetId: string;
    attachmentRole: AttachmentRole | null;
    sortOrder: number;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string;
    deletedAt: string | null;
    deletedBy: string | null;
};

export type CreateAttachmentInput = {
    storageBucket?: string;
    storageKey: string;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;
    sha256?: string | null;
    remarks?: string | null;
    uploadedBy?: string | null;
};

export type UpdateAttachmentInput = {
    remarks?: string | null;
    deletedAt?: string | null;
    deletedBy?: string | null;
};

export type CreateAttachmentLinkInput = {
    attachmentId: string;
    targetType: AssetTargetType;
    targetId: string;
    attachmentRole?: AttachmentRole | null;
    sortOrder?: number;
    createdBy?: string | null;
};

export type UpdateAttachmentLinkInput = {
    attachmentRole?: AttachmentRole | null;
    sortOrder?: number;
    deletedAt?: string | null;
    deletedBy?: string | null;
};

export type AttachmentListItem = {
    id: string;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;
    uploadedAt: string;
};

export type LinkedAttachmentListItem = {
    linkId: string;
    attachmentId: string;
    targetType: AssetTargetType;
    targetId: string;
    attachmentRole: AttachmentRole | null;
    sortOrder: number;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;
    uploadedAt: string;
};
