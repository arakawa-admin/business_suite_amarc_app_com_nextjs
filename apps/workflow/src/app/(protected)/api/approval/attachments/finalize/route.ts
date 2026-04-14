import { NextResponse } from "next/server";

import { AttachmentCreateInput } from '@/schemas/approval/attachmentSchema';
import { ApprovalDraftType } from "@/schemas/approval/approvalDraftSchema";

import { finalizeDraftAttachments } from "@/services/approval/approvalAttachmentService";

export async function POST(req: Request) {
    const {
        files,
        current_revision_id,
        profile_id,
        draft,
        removedAttachmentIds,
    } = (await req.json()) as {
        files: AttachmentCreateInput[],
        current_revision_id: string,
        profile_id: string,
        draft?: ApprovalDraftType,
        removedAttachmentIds: string[]
    };

    const { ok, error } = await finalizeDraftAttachments({
        files,
        current_revision_id,
        profile_id,
        draft,
        removedAttachmentIds,
    });

    if (!ok)
        return NextResponse.json({ ok: false, error }, { status: 500 });

    return NextResponse.json({ ok: true, error: "" });
}

