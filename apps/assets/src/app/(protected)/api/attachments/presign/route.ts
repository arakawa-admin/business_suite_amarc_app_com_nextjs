import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createPresignedPutUrl } from "@cloudflare/storage/r2.server";

type PresignRequestBody = {
    filename: string;
    contentType: string;
};

function buildStorageKey(filename: string): string {
    const ext = filename.includes(".") ? filename.split(".").pop() : "";

    const yyyy = new Date().getFullYear();
    const mm = String(new Date().getMonth() + 1).padStart(2, "0");
    const dd = String(new Date().getDate()).padStart(2, "0");

    const safeExt = ext ? `.${ext}` : "";

    return `attachments/${yyyy}/${mm}/${dd}/${randomUUID()}${safeExt}`;
}

export async function POST(request: Request) {
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
		const allowed = [
			"application/pdf",
			"image/png",
			"image/jpeg",
			"image/webp",
		];
		const safeContentType = allowed.includes(body.contentType)
			? body.contentType
			: "application/octet-stream";

		// const client = createR2Client();
        const storageKey = buildStorageKey(body.filename);
		const uploadUrl = await createPresignedPutUrl({
			bucket,
			key: storageKey,
			contentType: safeContentType,
			expiresInSeconds: 60,
		});

        // const command = new PutObjectCommand({
        //     Bucket: bucket,
        //     Key: storageKey,
        //     ContentType: body.contentType,
        // });

        // const uploadUrl = await getSignedUrl(client, command, {
        //     expiresIn: 60 * 5,
        // });

        return NextResponse.json({
            storageBucket: bucket,
            storageKey,
            uploadUrl,
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
