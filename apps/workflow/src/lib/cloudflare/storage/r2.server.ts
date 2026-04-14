import "server-only";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
    },
});

export async function createPresignedPutUrl(args: {
    bucket: string;
    key: string;
    contentType: string;
    expiresInSeconds?: number;
}) {
    const command = new PutObjectCommand({
        Bucket: args.bucket,
        Key: args.key,
        ContentType: args.contentType,
    });

    const url = await getSignedUrl(r2, command, {
        expiresIn: args.expiresInSeconds ?? 60,
    });

    return url;
}
