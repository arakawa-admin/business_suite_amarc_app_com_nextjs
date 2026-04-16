import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client } from "@cloudflare/storage/r2.server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type PresignRequestBody = {
    filename: string;
    contentType: string;
    thumbnailContentType: string;
};

function splitExt(filename: string) {
    const index = filename.lastIndexOf(".");
    if (index < 0) {
        return { base: filename, ext: "" };
    }
    return {
        base: filename.slice(0, index),
        ext: filename.slice(index),
    };
}

function buildStorageKeys(filename: string) {
    const { ext } = splitExt(filename);
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const id = randomUUID();

    return {
        originalStorageKey: `attachments/${yyyy}/${mm}/${dd}/${id}${ext || ""}`,
        thumbnailStorageKey: `attachments/${yyyy}/${mm}/${dd}/${id}.thumb.png`,
    };
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = (await request.json()) as PresignRequestBody;

        if (!body.filename || !body.contentType) {
            return NextResponse.json(
                { message: "filename and contentType are required" },
                { status: 400 },
            );
        }

        const bucket = process.env.R2_BUCKET_NAME;
        if (!bucket) {
            throw new Error("R2_BUCKET_NAME is not configured");
        }

		// contentTypeの許可リスト（必要に応じて追加）
		// const allowed = [
		// 	"application/pdf",
		// 	"image/png",
		// 	"image/jpeg",
		// 	"image/webp",
		// ];
        // if (!allowed.includes(body.contentType)) {
        // 	return NextResponse.json(
        // 		{ message: "contentType is not allowed" },
        // 		{ status: 400 },
        // 	);
        // }

		const client = createR2Client();
        const { originalStorageKey, thumbnailStorageKey } = buildStorageKeys(
            body.filename,
        );
        const originalUploadUrl = await getSignedUrl(
            client,
            new PutObjectCommand({
                Bucket: bucket,
                Key: originalStorageKey,
                ContentType: body.contentType,
            }),
            { expiresIn: 60 * 5 },
        );

        const thumbnailUploadUrl = await getSignedUrl(
            client,
            new PutObjectCommand({
                Bucket: bucket,
                Key: thumbnailStorageKey,
                ContentType: body.thumbnailContentType,
            }),
            { expiresIn: 60 * 5 },
        );

        return NextResponse.json({
            storageBucket: bucket,
            original: {
                storageKey: originalStorageKey,
                uploadUrl: originalUploadUrl,
            },
            thumbnail: {
                storageKey: thumbnailStorageKey,
                uploadUrl: thumbnailUploadUrl,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to create presigned URL",
            },
            { status: 500 },
        );
    }
}
