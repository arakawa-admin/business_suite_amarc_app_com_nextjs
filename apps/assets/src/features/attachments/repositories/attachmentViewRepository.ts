import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { findAttachmentById } from "./attachmentRepository";
import { createR2Client } from "@cloudflare/storage/r2.server";

export async function createAttachmentViewUrl(attachmentId: string) {
    const attachment = await findAttachmentById(attachmentId);

    if (!attachment || attachment.deletedAt) {
        throw new Error("Attachment not found");
    }

    const client = createR2Client();

    const command = new GetObjectCommand({
        Bucket: attachment.storageBucket,
        Key: attachment.storageKey,
        ResponseContentType: attachment.contentType ?? undefined,
    });
    const viewUrl = await getSignedUrl(client, command, {
        expiresIn: 60 * 5,
    });

    let thumbnailViewUrl: string | null = null;
    if(attachment.thumbnailStorageKey) {
        const thumbNailCommand = new GetObjectCommand({
            Bucket: attachment.storageBucket,
            Key: attachment.thumbnailStorageKey,
            ResponseContentType: attachment.thumbnailContentType ?? undefined,
        });
        thumbnailViewUrl = await getSignedUrl(client, thumbNailCommand, {
            expiresIn: 60 * 5,
        });
    }

    return {
        attachmentId: attachment.id,
        originalFilename: attachment.originalFilename,
        contentType: attachment.contentType,
        viewUrl,
        thumbnailViewUrl,
    };
}

export async function createAttachmentViewUrls(attachmentIds: string[]) {
    const uniqueIds = [...new Set(attachmentIds)].filter(Boolean);

    const results = await Promise.all(
        uniqueIds.map(async (attachmentId) => {
            const item = await createAttachmentViewUrl(attachmentId);
            return [attachmentId, item] as const;
        }),
    );

    return Object.fromEntries(results) as Record<
        string,
        {
            attachmentId: string;
            originalFilename: string;
            contentType: string | null;
            viewUrl: string;
            thumbnailViewUrl: string | null;
        }
    >;
}
