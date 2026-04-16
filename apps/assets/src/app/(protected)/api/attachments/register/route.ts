import { NextResponse } from "next/server";
import { createAttachment } from "@/features/attachments/repositories/attachmentRepository";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

type RegisterAttachmentRequestBody = {
    storageBucket: string;
    storageKey: string;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;
    thumbnailStorageKey: string | null;
    thumbnailContentType: string | null;
    thumbnailByteSize: number | null;
    sha256?: string | null;
    remarks?: string | null;
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as RegisterAttachmentRequestBody;

        if (!body.storageBucket || !body.storageKey || !body.originalFilename) {
            return NextResponse.json(
                { message: "required fields are missing" },
                { status: 400 },
            );
        }

        const currentStaffId = await findCurrentStaffIdOrThrow();

        const result = await createAttachment({
            storageBucket: body.storageBucket,
            storageKey: body.storageKey,
            originalFilename: body.originalFilename,
            contentType: body.contentType,
            byteSize: body.byteSize,
            sha256: body.sha256 ?? null,
            remarks: body.remarks ?? null,
            uploadedBy: currentStaffId ?? null,

            thumbnailStorageKey: body.thumbnailStorageKey,
            thumbnailContentType: body.thumbnailContentType,
            thumbnailByteSize: body.thumbnailByteSize,
        });

        return NextResponse.json({
            attachmentId: result.id,
        });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to register attachment",
            },
            { status: 500 },
        );
    }
}
