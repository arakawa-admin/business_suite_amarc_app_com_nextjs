import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// todo .env設定
export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
    },
});


export async function uploadToR2(file: File, bucket: string) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split(".").pop();
    const key = `${randomUUID()}.${ext}`;

    await r2.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        })
    );

    return {
        key,
        url: `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`,
        size: file.size,
        type: file.type,
        extension: ext,
    };
}

export async function deleteFromR2(keyOrUrl: string, bucket: string): Promise<void> {
    const key = toR2Key(keyOrUrl);

    await r2.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            // Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
            Key: key,
        })
    );
}

// 先頭一致で R2 公開URL + "/" を取り除き、さらに先頭の "/" を除去
function toR2Key(input: string): string {
    const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/+$/, "");
    if (!base) return input.replace(/^\/+/, ""); // 念のため

    // `${PUBLIC_URL}/` を前方一致でだけ取り除く
    const prefix = `${base}/`;

    // 正規表現用にエスケープ
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`^${esc(prefix)}`);

    // 前方一致で除外 → 先頭 "/" も除去
    return input.replace(re, "").replace(/^\/+/, "");
}
