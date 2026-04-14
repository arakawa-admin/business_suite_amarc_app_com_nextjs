import { deleteDraftWithAttachments } from "@/services/approval/approvalDraftService";
import { NextResponse } from "next/server";

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    const { ok, error: delAttachmentErr } = await deleteDraftWithAttachments(id);

    if (!ok)
        return NextResponse.json({ error: delAttachmentErr }, { status: 500 });

    return NextResponse.json({ ok });
}

