"use server";

import { revalidatePath } from "next/cache";
import {
    createPermit,
    createPermitReminders,
    replacePermitReminders,
    updatePermit,
} from "../repositories/permitRepository";
import { createAttachmentLinks, syncAttachmentLinks } from "../../attachments/repositories/attachmentLinkRepository";
import { markAttachmentsLinked } from "@/features/attachments/repositories/attachmentRepository";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

import {
    createPermitSchema,
    type PermitSubmitValues,
} from "../schemas/permitSchema";
import {
    mapPermitSubmitValuesToCreateInput,
    mapPermitSubmitValuesToReplaceRemindersInput,
    mapPermitSubmitValuesToUpdateInput,
} from "../mappers/permitMappers";


export async function permitCreateAction(
    values: PermitSubmitValues,
): Promise<{ id: string }> {
    const parsed = createPermitSchema.safeParse(values);

    if (!parsed.success) {
        throw new Error("入力内容を確認してください。");
    }

    const permit = await createPermit(
        mapPermitSubmitValuesToCreateInput(parsed.data),
    );

    const reminderInput = mapPermitSubmitValuesToReplaceRemindersInput(
        permit.id,
        parsed.data,
    );
    await createPermitReminders(permit.id, reminderInput.reminders);


    if (parsed.data.attachments.length > 0) {
        await createAttachmentLinks(
            parsed.data.attachments.map((item, index) => ({
                attachmentId: item.attachmentId,
                targetType: "permit",
                targetId: permit.id,
                attachmentRole: "general",
                sortOrder: index+1,
            })),
        );
        
        await markAttachmentsLinked(parsed.data.attachments.map((item) => item.attachmentId));
    }

    revalidatePath("/permits");
    return permit;
}

export async function permitEditAction(
    values: PermitSubmitValues,
    permitId: string,
): Promise<void> {
    const parsed = createPermitSchema.safeParse(values);

    if (!parsed.success) {
        throw new Error("入力内容を確認してください。");
    }

    const currentStaffId = await findCurrentStaffIdOrThrow();

    await updatePermit(
        permitId,
        mapPermitSubmitValuesToUpdateInput(parsed.data),
    );

    await replacePermitReminders(
        mapPermitSubmitValuesToReplaceRemindersInput(permitId, parsed.data),
    );

    await syncAttachmentLinks({
            targetType: "permit",
            targetId: permitId,
            attachments: parsed.data.attachments.map((item) => ({
            attachmentId: item.attachmentId,
            attachmentRole: "general",
        })),
        createdBy: currentStaffId,
        deletedBy: currentStaffId,
    });

    revalidatePath("/permits");
    revalidatePath(`/permits/${permitId}`);
    revalidatePath(`/permits/${permitId}/edit`);
}
