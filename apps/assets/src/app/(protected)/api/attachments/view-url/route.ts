import { NextResponse } from "next/server";
import "server-only";

import { createAttachmentViewUrl } from "@/features/attachments/repositories/attachmentViewRepository";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const attachmentId = searchParams.get("attachmentId");

        if (!attachmentId) {
            return NextResponse.json(
                { message: "attachmentId is required" },
                { status: 400 },
            );
        }

        const result = await createAttachmentViewUrl(attachmentId);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to create signed view URL",
            },
            { status: 500 },
        );
    }
}
