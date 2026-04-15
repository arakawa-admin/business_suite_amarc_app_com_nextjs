import "server-only";
import { createClient } from "@supabase-shared/server";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

import type {
    CreatePermitInput,
    HardDeletePermitCheckResult,
    PermitDetailRow,
    PermitListRow,
    PermitReminderViewRow,
    ReplacePermitRemindersInput,
    SoftDeletePermitInput,
    UpdatePermitInput,
} from "../types/permitTypes";

type FindPermitListParams = {
    q?: string;
    categoryId?: string;
    status?: "" | "unknown" | "expired" | "alert_due" | "active";
};

export async function findPermitList(
    params: FindPermitListParams = {},
): Promise<PermitListRow[]> {
    const supabase = await createClient();

    let query = supabase
        .schema("assets")
        .from("v_permits_list")
        .select("*")
        .order("created_at", { ascending: false });

    if (params.q) {
        const q = params.q.trim();
        query = query.or(
            [
                `subject_name.ilike.%${q}%`,
                `business_name.ilike.%${q}%`,
                `permit_number.ilike.%${q}%`,
            ].join(","),
        )
    }

    if (params.categoryId) {
        query = query.eq("category_id", params.categoryId);
    }

    if (params.status) {
        query = query.eq("calculated_status_code", params.status);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`findPermitList failed: ${error.message}`);
    }

    return (data ?? []) as PermitListRow[];
}

export async function findPermitById(
    id: string,
): Promise<PermitDetailRow | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("v_permits_list")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();

    if (error) {
        throw new Error(`findPermitById failed: ${error.message}`);
    }

    return data as PermitDetailRow | null;
}

export async function findPermitRemindersByPermitId(
    permitId: string,
): Promise<PermitReminderViewRow[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("v_permit_reminders")
        .select("*")
        .eq("permit_id", permitId)
        .order("due_on", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(
            `findPermitRemindersByPermitId failed: ${error.message}`,
        );
    }

    return (data ?? []) as PermitReminderViewRow[];
}

export async function createPermit(
    input: CreatePermitInput,
): Promise<{ id: string }> {
    const supabase = await createClient();
    const currentStaffId = await findCurrentStaffIdOrThrow();
    const inputWithStaff = {
        ...input,
        created_by: currentStaffId,
        updated_by: currentStaffId,
    }

    const { data, error } = await supabase
        .schema("assets")
        .from("permits")
        .insert(inputWithStaff)
        .select("id")
        .single();

    if (error) {
        throw new Error(`createPermit failed: ${error.message}`);
    }

    return data as { id: string };
}

export async function updatePermit(
    id: string,
    input: UpdatePermitInput,
): Promise<void> {
    const supabase = await createClient();
    const currentStaffId = await findCurrentStaffIdOrThrow();
    const inputWithStaff = {
        ...input,
        updated_by: currentStaffId,
    }

    const { error } = await supabase
        .schema("assets")
        .from("permits")
        .update(inputWithStaff)
        .eq("id", id);

    if (error) {
        throw new Error(`updatePermit failed: ${error.message}`);
    }
}

export async function createPermitReminders(
    permitId: string,
    reminders: { dueOn: string | null; alertOn: string | null }[],
): Promise<void> {
    const supabase = await createClient();

    const insertRows = reminders
        .filter((row) => row.dueOn || row.alertOn)
        .map((row) => ({
            target_type: "permit",
            target_id: permitId,
            reminder_type_code: "permit_expiry",
            reminder_type_name: "有効期限",
            due_on: row.dueOn,
            alert_on: row.alertOn,
            completed_on: null,
            // status_code: "planned",
            // status_name: "予定",
            memo: null,
        }));

    if (insertRows.length === 0) return;

    const { error } = await supabase
        .schema("assets")
        .from("reminders")
        .insert(insertRows);

    if (error) {
        throw new Error(`createPermitReminders failed: ${error.message}`);
    }
}

export async function replacePermitReminders(
    input: ReplacePermitRemindersInput,
): Promise<void> {
    const supabase = await createClient();

    const { error: deleteError } = await supabase
        .schema("assets")
        .from("reminders")
        .delete()
        .eq("target_type", "permit")
        .eq("target_id", input.permitId);

    if (deleteError) {
        throw new Error(
            `replacePermitReminders delete failed: ${deleteError.message}`,
        );
    }

    const insertRows = input.reminders
        .filter((row) => row.dueOn || row.alertOn)
        .map((row) => ({
            target_type: "permit",
            target_id: input.permitId,
            reminder_type_code: "permit_expiry",
            reminder_type_name: "有効期限",
            due_on: row.dueOn,
            alert_on: row.alertOn,
            completed_on: null,
            // status_code: "planned",
            // status_name: "予定",
            memo: null,
        }));

    if (insertRows.length === 0) return;

    const { error: insertError } = await supabase
        .schema("assets")
        .from("reminders")
        .insert(insertRows);

    if (insertError) {
        throw new Error(
            `replacePermitReminders insert failed: ${insertError.message}`,
        );
    }
}

export async function softDeletePermit(
    input: SoftDeletePermitInput,
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("permits")
        .update({
            deleted_at: new Date().toISOString(),
            deleted_by: input.deletedBy,
            delete_reason: input.deleteReason ?? null,
        })
        .eq("id", input.permitId)
        .is("deleted_at", null);

    if (error) {
        throw new Error(`softDeletePermit failed: ${error.message}`);
    }
}

export async function restorePermit(permitId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("permits")
        .update({
            deleted_at: null,
            deleted_by: null,
            delete_reason: null,
        })
        .eq("id", permitId);

    if (error) {
        throw new Error(`restorePermit failed: ${error.message}`);
    }
}

export async function checkPermitHardDelete(
    permitId: string,
): Promise<HardDeletePermitCheckResult> {
    const supabase = await createClient();

    const [
        { count: reminderCount, error: reminderError },
        { count: logCount, error: logError },
    ] = await Promise.all([
        supabase
            .schema("assets")
            .from("reminders")
            .select("*", { count: "exact", head: true })
            .eq("target_type", "permit")
            .eq("target_id", permitId),
        supabase
            .schema("assets")
            .from("permit_renewal_logs")
            .select("*", { count: "exact", head: true })
            .eq("permit_id", permitId),
    ]);

    if (reminderError) {
        throw new Error(
            `checkPermitHardDelete reminders failed: ${reminderError.message}`,
        );
    }

    if (logError) {
        throw new Error(
            `checkPermitHardDelete logs failed: ${logError.message}`,
        );
    }

    return {
        permitId,
        reminderCount: reminderCount ?? 0,
        renewalLogCount: logCount ?? 0,
        canHardDelete: (reminderCount ?? 0) === 0 && (logCount ?? 0) === 0,
    };
}

export async function hardDeletePermit(permitId: string): Promise<void> {
    const check = await checkPermitHardDelete(permitId);

    if (!check.canHardDelete) {
        throw new Error(
            `この許認可は完全削除できません。related reminders=${check.reminderCount}, renewal_logs=${check.renewalLogCount}`,
        );
    }

    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("permits")
        .delete()
        .eq("id", permitId);

    if (error) {
        throw new Error(`hardDeletePermit failed: ${error.message}`);
    }
}


export async function findPermitLabelOptions<K extends keyof PermitDetailRow>(
    columnName: K
): Promise<{ id: string; name: string }[]> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from("permits")
        .select(columnName as string)
        .is("deleted_at", null)
        .not(columnName as string, "is", null);

    if (error) {
        throw new Error(`候補の取得に失敗しました: ${error.message}`);
    }

    const uniqueLabels = [
        ...new Set(
        ((data as any[] | null) ?? [])
            .map((row) => row[columnName as string])
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter((value) => value.length > 0),
        ),
    ].sort((a, b) => a.localeCompare(b, "ja"));

    return uniqueLabels.map((label) => ({
        id: label,
        name: label,
    }));
}
