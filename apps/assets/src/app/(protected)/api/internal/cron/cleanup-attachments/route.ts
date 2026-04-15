import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
    findStaleUnlinkedAttachmentsForCleanup,
    hardDeleteAttachments,
} from "@/features/attachments/repositories/attachmentRepository";
import { createR2Client } from "@cloudflare/storage/r2.server";

function isAuthorized(request: Request): boolean {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
        return false;
    }

    return authHeader === `Bearer ${expectedToken}`;
}

// TODO リリース時にcronが走るようにする
// TODO 日に一度実行。ゴミ添付ファイルを削除
export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const candidates = await findStaleUnlinkedAttachmentsForCleanup({
            olderThanHours: 24,
            limit: 100,
        });
        if (candidates.length === 0) {
            return NextResponse.json({
                ok: true,
                deletedCount: 0,
                message: "No stale unlinked attachments",
            });
        }

        const client = createR2Client();
        const deletedIds: string[] = [];
        const failedKeys: { id: string; storageKey: string; reason: string }[] = [];

        for (const item of candidates) {
            try {
                await client.send(
                    new DeleteObjectCommand({
                        Bucket: item.storageBucket,
                        Key: item.storageKey,
                    }),
                );

                deletedIds.push(item.id);
            } catch (error) {
                failedKeys.push({
                    id: item.id,
                    storageKey: item.storageKey,
                    reason: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        if (deletedIds.length > 0) {
            await hardDeleteAttachments(deletedIds);
        }

        return NextResponse.json({
            ok: true,
            deletedCount: deletedIds.length,
            failedCount: failedKeys.length,
            failedKeys,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to cleanup attachments",
            },
            { status: 500 },
        );
    }
}
