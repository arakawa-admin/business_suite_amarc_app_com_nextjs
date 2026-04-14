import { NextResponse } from "next/server";
import "server-only";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
    },
});

export async function POST(req: Request) {
    const { bucket, key } = await req.json();

    const url = await getSignedUrl(
        r2,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 300 }, // 300秒限定
    );

    return NextResponse.json({ url });
}
