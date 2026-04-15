import "server-only";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function createR2Client() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error("R2 credentials are not configured");
    }

    return new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

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

    const url = await getSignedUrl(
        createR2Client(),
        command,
        {expiresIn: args.expiresInSeconds ?? 60}
    );

    return url;
}
