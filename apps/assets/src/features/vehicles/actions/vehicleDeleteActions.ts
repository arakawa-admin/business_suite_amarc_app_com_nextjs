"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    checkVehicleHardDelete,
    hardDeleteVehicle,
    restoreVehicle,
    softDeleteVehicle,
} from "../repositories/vehicleRepository";
import {
    softDeleteVehicleSchema,
    type SoftDeleteVehicleFormValues,
} from "../schemas/deleteVehicleSchema";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";
import { logDeleteAudit, logRestoreAudit } from "@/features/audit/services/auditLogService";

export type VehicleDeleteActionState = {
    ok: boolean;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

export async function softDeleteVehicleAction(
    values: SoftDeleteVehicleFormValues,
): Promise<VehicleDeleteActionState> {
    const parsed = softDeleteVehicleSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "入力内容を確認してください。",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {
        const currentStaffId = await findCurrentStaffIdOrThrow();

        await softDeleteVehicle({
            vehicleId: parsed.data.vehicleId,
            deletedBy: currentStaffId,
            deleteReason: parsed.data.deleteReason,
        });

        // ログ記録
        await logDeleteAudit({
            entityType: "vehicle",
            entityId: parsed.data.vehicleId,
            summary: "車両削除",
            currentStaffId,
            // TODO
            // metadata: {},
            // deleted: {},
        });

        revalidatePath("/vehicles");
        revalidatePath(`/vehicles/${parsed.data.vehicleId}`);
        revalidatePath(`/vehicles/${parsed.data.vehicleId}/edit`);

        return {
            ok: true,
            message: "車両を削除しました。",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "削除に失敗しました。",
        };
    }
}

export async function restoreVehicleAction(
    vehicleId: string,
): Promise<VehicleDeleteActionState> {
    try {
        const currentStaffId = await findCurrentStaffIdOrThrow();

        await restoreVehicle(vehicleId);


        // ログ記録
        await logRestoreAudit({
            entityType: "vehicle",
            entityId: vehicleId,
            summary: "車両復元",
            currentStaffId,
            // TODO
            // metadata: {},
            // restored: {},
        });

        revalidatePath("/vehicles");
        revalidatePath(`/vehicles/${vehicleId}`);
        revalidatePath(`/vehicles/${vehicleId}/edit`);

        return {
            ok: true,
            message: "車両を復元しました。",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "復元に失敗しました。",
        };
    }
}

export async function checkVehicleHardDeleteAction(vehicleId: string): Promise<
    VehicleDeleteActionState & {
        canHardDelete?: boolean;
        reminderCount?: number;
        renewalLogCount?: number;
    }
> {
    try {
        const result = await checkVehicleHardDelete(vehicleId);

        if (!result.canHardDelete) {
            return {
                ok: false,
                message: `関連データがあるため完全削除できません。reminders=${result.reminderCount} / renewal_logs=${result.renewalLogCount}`,
                canHardDelete: false,
                reminderCount: result.reminderCount,
                renewalLogCount: result.renewalLogCount,
            };
        }

        return {
            ok: true,
            message: "完全削除可能です。",
            canHardDelete: true,
            reminderCount: result.reminderCount,
            renewalLogCount: result.renewalLogCount,
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "確認に失敗しました。",
        };
    }
}

export async function hardDeleteVehicleAction(vehicleId: string): Promise<never> {
    // 将来ここで管理者権限チェック
    await hardDeleteVehicle(vehicleId);

    revalidatePath("/vehicles");
    redirect("/vehicles");
}
