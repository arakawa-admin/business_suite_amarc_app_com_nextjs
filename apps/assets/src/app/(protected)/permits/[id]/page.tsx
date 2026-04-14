import { notFound } from "next/navigation";
import {
    findPermitById,
    findPermitRemindersByPermitId,
} from "@/features/permits/repositories/permitRepository";
import { PermitDetail } from "@/features/permits/components/permitDetail";

export default async function PermitDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [permit, reminders] = await Promise.all([
        findPermitById(id),
        findPermitRemindersByPermitId(id),
    ]);

    if (!permit) {
        notFound();
    }

    return (
        <PermitDetail permit={permit} reminders={reminders} />
    );
}
