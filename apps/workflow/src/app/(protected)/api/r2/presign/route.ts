import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { createPresignedPutUrl } from "@/lib/cloudflare/storage/r2.server";

export async function POST(req: Request) {
    const body = await req.json();
    const { path, filename, contentType } = body as {
        path: string; // 例: approval/{approval_id}
        filename: string; // 元ファイル名
        contentType: string; // file.type
    };

    if (!path || !filename) {
        return NextResponse.json(
            { error: "path/filename is required" },
            { status: 400 },
        );
    }

    // contentTypeの許可リスト（必要に応じて追加）
    const allowed = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
    ];
    const safeContentType = allowed.includes(contentType)
        ? contentType
        : "application/octet-stream";

    const bucket = process.env.R2_BUCKET ?? "workflow-amarc-app-com";

    const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
    const attachmentId = randomUUID();

    // 上書き事故防止：毎回ユニーク key
    const key = `${path}/${attachmentId}.${ext}`;

    const url = await createPresignedPutUrl({
        bucket,
        key,
        contentType: safeContentType,
        expiresInSeconds: 60,
    });

    return NextResponse.json({
        url,
        bucket,
        storage_key: key,
        attachment_id: attachmentId,
        content_type: safeContentType,
    });
}
