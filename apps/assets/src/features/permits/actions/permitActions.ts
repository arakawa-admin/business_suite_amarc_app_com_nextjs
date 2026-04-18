"use server";

import { revalidatePath } from "next/cache";
import {
    findPermitById,
    createPermit,
    createPermitReminders,
    replacePermitReminders,
    updatePermit,
} from "../repositories/permitRepository";
import { createAttachmentLinks, syncAttachmentLinks } from "../../attachments/repositories/attachmentLinkRepository";
import { markAttachmentsLinked } from "@/features/attachments/repositories/attachmentRepository";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";
import { logCreateAudit, logUpdateAudit, buildAuditDiff } from "@/features/audit/services/auditLogService";

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
    const currentStaffId = await findCurrentStaffIdOrThrow();

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

    await logCreateAudit({
        entityType: "permit",
        entityId: permit.id,
        summary: "許認可登録",
        currentStaffId: currentStaffId,
        metadata: {
            // TODO: 変更内容の詳細を記録する
            // created: new Date().toISOString(),
        },
    });

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

    const currentPermit = await findPermitById(permitId);

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


    const updatedPermit = await findPermitById(permitId);
    if(currentPermit == null || updatedPermit == null) {
        throw new Error("許認可が見つからないので、ログを記録できませんでした。");
    }
    const before = {...currentPermit};
    const after = {...updatedPermit};
    const diff = buildAuditDiff({
        before,
        after,
    });

    await logUpdateAudit({
        entityType: "permit",
        entityId: permitId,
        summary: "許認可更新",
        currentStaffId,
        diff,
    });

    revalidatePath("/permits");
    revalidatePath(`/permits/${permitId}`);
    revalidatePath(`/permits/${permitId}/edit`);
}
