"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    checkPermitHardDelete,
    hardDeletePermit,
    restorePermit,
    softDeletePermit,
} from "../repositories/permitRepository";
import {
    softDeletePermitSchema,
    type SoftDeletePermitFormValues,
} from "../schemas/deletePermitSchema";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";
import { logDeleteAudit, logRestoreAudit } from "@/features/audit/services/auditLogService";

export type PermitDeleteActionState = {
    ok: boolean;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

export async function softDeletePermitAction(
    values: SoftDeletePermitFormValues,
): Promise<PermitDeleteActionState> {
    const parsed = softDeletePermitSchema.safeParse(values);

    if (!parsed.success) {
        return {
            ok: false,
            message: "入力内容を確認してください。",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {
        const currentStaffId = await findCurrentStaffIdOrThrow();

        await softDeletePermit({
            permitId: parsed.data.permitId,
            deletedBy: currentStaffId,
            deleteReason: parsed.data.deleteReason,
        });

        // ログ記録
        await logDeleteAudit({
            entityType: "permit",
            entityId: parsed.data.permitId,
            summary: "許認可削除",
            currentStaffId,
            // TODO
            // metadata: {},
            // deleted: {},
        });

        revalidatePath("/permits");
        revalidatePath(`/permits/${parsed.data.permitId}`);
        revalidatePath(`/permits/${parsed.data.permitId}/edit`);

        return {
            ok: true,
            message: "許認可を削除しました。",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "削除に失敗しました。",
        };
    }
}

export async function restorePermitAction(
    permitId: string,
): Promise<PermitDeleteActionState> {
    try {
        const currentStaffId = await findCurrentStaffIdOrThrow();

        await restorePermit(permitId);


        // ログ記録
        await logRestoreAudit({
            entityType: "permit",
            entityId: permitId,
            summary: "許認可復元",
            currentStaffId,
            // TODO
            // metadata: {},
            // restored: {},
        });

        revalidatePath("/permits");
        revalidatePath(`/permits/${permitId}`);
        revalidatePath(`/permits/${permitId}/edit`);

        return {
            ok: true,
            message: "許認可を復元しました。",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error ? error.message : "復元に失敗しました。",
        };
    }
}

export async function checkPermitHardDeleteAction(permitId: string): Promise<
    PermitDeleteActionState & {
        canHardDelete?: boolean;
        reminderCount?: number;
        renewalLogCount?: number;
    }
> {
    try {
        const result = await checkPermitHardDelete(permitId);

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

export async function hardDeletePermitAction(permitId: string): Promise<never> {
    // 将来ここで管理者権限チェック
    await hardDeletePermit(permitId);

    revalidatePath("/permits");
    redirect("/permits");
}
