import { notFound } from "next/navigation";
import {
    findPermitById,
    findPermitRemindersByPermitId,
} from "@/features/permits/repositories/permitRepository";
import { PermitDetail } from "@/features/permits/components/permitDetail";
import { findLinkedAttachmentsByTarget } from "@/features/attachments/repositories/attachmentLinkRepository";
import { createAttachmentViewUrl } from "@/features/attachments/repositories/attachmentViewRepository";
import { findCommentsByTarget } from "@/features/permits/comments/repositories/commentRepository";

export default async function PermitDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [permit, reminders, linkedAttachments] = await Promise.all([
        findPermitById(id),
        findPermitRemindersByPermitId(id),
        findLinkedAttachmentsByTarget({ targetType: "permit", targetId: id }),
    ]);

    if (!permit) {
        notFound();
    }

    const comments = await findCommentsByTarget({
        targetType: "permit",
        targetId: id,
    });

    const itemsWithViewUrl = await Promise.all(
        linkedAttachments.map(async (item) => {
            const result = await createAttachmentViewUrl(item.attachmentId);

            return {
                attachmentId: item.attachmentId,
                originalFilename: item.originalFilename,
                contentType: item.contentType,
                byteSize: item.byteSize,
                viewUrl: result.viewUrl,
                previewUrl: null,
            };
        }),
    );

    return (
        <PermitDetail
            permit={permit}
            reminders={reminders}
            comments={comments}
            attachments={itemsWithViewUrl}
            />
    );
}
