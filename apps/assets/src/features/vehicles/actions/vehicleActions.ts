"use server";

import { revalidatePath } from "next/cache";
import {
    findVehicleById,
    createVehicle,
    createVehicleReminders,
    replaceVehicleReminders,
    updateVehicle,
} from "../repositories/vehicleRepository";
import { createAttachmentLinks, syncAttachmentLinks } from "../../attachments/repositories/attachmentLinkRepository";
import { markAttachmentsLinked } from "@/features/attachments/repositories/attachmentRepository";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";
import { logCreateAudit, logUpdateAudit, buildAuditDiff } from "@/features/audit/services/auditLogService";

import {
    mapVehicleSubmitValuesToReplaceRemindersInput,
    mapVehicleSubmitValuesToCreateInput,
} from "../mappers/vehicleMappers";

import {
    createVehicleSchema,
    type VehicleSubmitValues,
    vehicleSubmitSchema,
} from "../schemas/vehicleSchema";

function formatDateOnly(value: Date | null | undefined): string | null {
    if (!value) return null;

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export async function vehicleCreateAction(
    values: VehicleSubmitValues,
): Promise<{ id: string }> {
    const parsed = vehicleSubmitSchema.safeParse(values);
    const currentStaffId = await findCurrentStaffIdOrThrow();
    if (!parsed.success) {
        throw new Error("入力内容を確認してください。");
    }

    const vehicle = await createVehicle({
        ...mapVehicleSubmitValuesToCreateInput(parsed.data),
        created_by: currentStaffId,
        updated_by: currentStaffId,
    });
    const reminders = parsed.data.reminders.map((row) => ({
        dueOn: formatDateOnly(row.dueOn),
        alertOn: formatDateOnly(row.alertOn),
    }))
    await createVehicleReminders(vehicle.id, reminders);


    if (parsed.data.attachments.length > 0) {
        await createAttachmentLinks(
            parsed.data.attachments.map((item, index) => ({
                attachmentId: item.attachmentId,
                targetType: "vehicle",
                targetId: vehicle.id,
                attachmentRole: "general",
                sortOrder: index+1,
            })),
        );
        await markAttachmentsLinked(parsed.data.attachments.map((item) => item.attachmentId));
    }

    await logCreateAudit({
        entityType: "vehicle",
        entityId: vehicle.id,
        summary: "車両登録",
        currentStaffId: currentStaffId,
        metadata: {
            // TODO: 変更内容の詳細を記録する
            // created: new Date().toISOString(),
        },
    });

    revalidatePath("/vehicles");
    return vehicle;
}

export async function vehicleEditAction(
    values: VehicleSubmitValues,
    vehicleId: string,
): Promise<void> {
    const parsed = createVehicleSchema.safeParse(values);

    if (!parsed.success) {
        throw new Error("入力内容を確認してください。");
    }

    const currentStaffId = await findCurrentStaffIdOrThrow();

    const currentVehicle = await findVehicleById(vehicleId);

    await updateVehicle(
        vehicleId,
        {
            ...mapVehicleSubmitValuesToCreateInput(parsed.data),
            updated_by: currentStaffId,
        }
    );

    await replaceVehicleReminders(
        mapVehicleSubmitValuesToReplaceRemindersInput(vehicleId, parsed.data),
    );
    // await replaceVehicleReminders({
    //     vehicleId,
    //     reminders: parsed.data.reminders.map((row) => ({
    //         dueOn: formatDateOnly(row.dueOn),
    //         alertOn: formatDateOnly(row.alertOn),
    //         reminderTypeCode: row.reminderTypeCode ?? "vehicle_voluntary_insurance_expiry",
    //     })),
    // });

    await syncAttachmentLinks({
        targetType: "vehicle",
        targetId: vehicleId,
        attachments: parsed.data.attachments.map((item) => ({
            attachmentId: item.attachmentId,
            attachmentRole: "general",
        })),
        createdBy: currentStaffId,
        deletedBy: currentStaffId,
    });


    const updatedVehicle = await findVehicleById(vehicleId);
    if(currentVehicle == null || updatedVehicle == null) {
        throw new Error("車両が見つからないので、ログを記録できませんでした。");
    }
    const before = {...currentVehicle};
    const after = {...updatedVehicle};
    const diff = buildAuditDiff({
        before,
        after,
    });

    await logUpdateAudit({
        entityType: "vehicle",
        entityId: vehicleId,
        summary: "車両更新",
        currentStaffId,
        diff,
    });

    revalidatePath("/vehicles");
    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath(`/vehicles/${vehicleId}/edit`);
}
