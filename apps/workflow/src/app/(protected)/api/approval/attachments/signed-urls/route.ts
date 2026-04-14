import { NextResponse } from "next/server";
import "server-only";

import { createClient } from "@supabase-shared/server";
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

type Body = { attachmentIds: string[] };

export async function POST(req: Request) {
    const { attachmentIds } = (await req.json()) as Body;

    if (!Array.isArray(attachmentIds) || attachmentIds.length === 0) {
        return NextResponse.json({ urls: {} });
    }

    // ✅ RLS効かせる（Server Component/Routeはservice_roleじゃない前提）
    const supabase = await createClient();
    const approval = supabase.schema("approval");

    // attachments 取得（RLSで「見れるものだけ」返る）
    const { data: atts, error } = await approval
        .from("attachments")
        .select("id, storage_key, content_type, thumbnail_key")
        .in("id", attachmentIds);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bucket = process.env.R2_BUCKET ?? "workflow-amarc-app-com";

    const urls = Object.fromEntries(
        await Promise.all(
            (atts ?? []).map(async (a) => {
                const url = await getSignedUrl(
                    r2,
                    new GetObjectCommand({ Bucket: bucket, Key: a.storage_key }),
                    { expiresIn: 300 }, // 300秒（必要なら延ばす）
                );
                const thumbnailUrl =
                    a.thumbnail_key
                    ? await getSignedUrl(
                        r2,
                        new GetObjectCommand({ Bucket: bucket, Key: a.thumbnail_key }),
                        { expiresIn: 300 }, // 300秒（必要なら延ばす）
                    )
                    : null;
                return [a.id, {url, thumbnailUrl}] as const;
            })
        )
    )
    return NextResponse.json({ urls });
}
