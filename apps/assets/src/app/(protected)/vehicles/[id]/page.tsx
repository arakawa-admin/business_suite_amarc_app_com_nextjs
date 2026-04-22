import { notFound } from "next/navigation";
import {
    findVehicleById,
    findVehicleRemindersByVehicleId,
} from "@/features/vehicles/repositories/vehicleRepository";
import { VehicleDetail } from "@/features/vehicles/components/vehicleDetail";
import { findLinkedAttachmentsByTarget } from "@/features/attachments/repositories/attachmentLinkRepository";
import { createAttachmentViewUrl } from "@/features/attachments/repositories/attachmentViewRepository";
// import { findCommentsByTarget } from "@/features/vehicles/comments/repositories/commentRepository";

export default async function VehicleDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [
        vehicle,
        reminders,
        linkedAttachments
    ] = await Promise.all([
        findVehicleById(id),
        findVehicleRemindersByVehicleId(id),
        findLinkedAttachmentsByTarget({ targetType: "vehicle", targetId: id }),
    ]);

    if (!vehicle) {
        notFound();
    }

    // const comments = await findCommentsByTarget({
    //     targetType: "vehicle",
    //     targetId: id,
    // });

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
        <VehicleDetail
            vehicle={vehicle}
            reminders={reminders}
            // comments={comments}
            attachments={itemsWithViewUrl}
            />
    );
}
