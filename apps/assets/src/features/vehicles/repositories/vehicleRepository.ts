import "server-only";
import { createClient } from "@supabase-shared/server";

import type {
    VehicleDetailItem,
    // VehicleFormValues,
    CreateVehicleInput,
    ReplaceVehicleRemindersInput,
    VehicleDetailRow,
    VehicleReminderViewRow,
} from "../types/vehicleTypes";
import  { mapVehicleRowToDetailItem } from "../mappers/vehicleMappers";

type CreateVehicleInputWithStaff = CreateVehicleInput & {
    created_by?: string;
    updated_by?: string;
};
type UpdateVehicleInputWithStaff = CreateVehicleInput & {
    created_by?: string;
    updated_by?: string;
};

type FindVehicleListParams = {
    q?: string;
    departmentId?: string;
    status?: "" | "unknown" | "expired" | "alert_due" | "active";
};

export async function findVehicleList(
    params: FindVehicleListParams = {},
): Promise<VehicleDetailItem[]> {
    const supabase = await createClient();

    let query = supabase
        .schema("assets")
        .from("v_vehicles_list")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (params.q) {
        const q = params.q.trim();
        query = query.or(
            [
                `registration_number.ilike.%${q}%`,
                `manufacturer_name.ilike.%${q}%`,
                `vehicle_name.ilike.%${q}%`,
                `type_name.ilike.%${q}%`,
            ].join(","),
        )
    }

    if (params.departmentId) {
        query = query.eq("department_id", params.departmentId);
    }

    // if (params.status) {
    //     query = query.eq("calculated_status_code", params.status);
    // }

    const { data, error } = await query;

    if (error) {
        throw new Error(`findVehicleList failed: ${error.message}`);
    }

    return data
        ? data.map(d => mapVehicleRowToDetailItem(d as VehicleDetailRow))
        : [];
}

export async function findVehicleById(
    id: string,
): Promise<VehicleDetailItem | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("v_vehicles_list")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();

    if (error) {
        throw new Error(`findVehicleById failed: ${error.message}`);
    }

    return data
        ? mapVehicleRowToDetailItem(data as VehicleDetailRow)
        : null;
}

export async function findVehicleRemindersByVehicleId(
    vehicleId: string,
): Promise<VehicleReminderViewRow[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("v_vehicle_reminders")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("due_on", { ascending: true, nullsFirst: false })
        .order("reminder_created_at", { ascending: true })
        ;

    if (error) {
        throw new Error(
            `findVehicleRemindersByVehicleId failed: ${error.message}`,
        );
    }

    // return data
    //     ? mapReminderRowToFormValues(data as VehicleReminderViewRow)
    //     : null;
    return (data ?? []) as VehicleReminderViewRow[];
}

export async function createVehicle(
    params: CreateVehicleInputWithStaff,
): Promise<{ id: string }> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .schema("assets")
        .from("vehicles")
        .insert(params)
        .select("id")
        .single();

    if (error) {
        throw new Error(`createVehicle failed: ${error.message}`);
    }

    return data as { id: string };
}

export async function updateVehicle(
    id: string,
    input: UpdateVehicleInputWithStaff,
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("vehicles")
        .update(input)
        .eq("id", id);

    if (error) {
        throw new Error(`updateVehicle failed: ${error.message}`);
    }
}

export async function createVehicleReminders(
    vehicleId: string,
    reminders: { dueOn: string | null; alertOn: string | null }[],
): Promise<void> {
    const supabase = await createClient();
console.log('createVehicleReminders', reminders)
    const insertRows = reminders
        .filter((row) => row.dueOn || row.alertOn)
        .map((row) => ({
            target_type: "vehicle",
            target_id: vehicleId,
            reminder_type_code: "vehicle_expiry",
            reminder_type_name: "有効期限",
            due_on: row.dueOn,
            alert_on: row.alertOn,
            completed_on: null,
            // status_code: "planned",
            // status_name: "予定",
            // memo: null,
        }));

    if (insertRows.length === 0) return;

    const { error } = await supabase
        .schema("assets")
        .from("reminders")
        .insert(insertRows);

    if (error) {
        throw new Error(`createVehicleReminders failed: ${error.message}`);
    }
}

export async function replaceVehicleReminders(
    input: ReplaceVehicleRemindersInput,
): Promise<void> {
    const supabase = await createClient();

    const { error: deleteError } = await supabase
        .schema("assets")
        .from("reminders")
        .delete()
        .eq("target_type", "vehicle")
        .eq("target_id", input.vehicleId);

    if (deleteError) {
        throw new Error(
            `replaceVehicleReminders delete failed: ${deleteError.message}`,
        );
    }

    const insertRows = input.reminders
        .filter((row) => row.dueOn || row.alertOn)
        .map((row) => {
            const reminderTypeCode =
                row.reminderTypeCode ?? "vehicle_inspection_expiry";

            return {
                target_type: "vehicle",
                target_id: input.vehicleId,
                reminder_type_code: reminderTypeCode,
                reminder_type_name:
                    reminderTypeCode === "vehicle_insurance_expiry"
                        ? "任意保険期限"
                        : "車検期限",
                due_on: row.dueOn,
                alert_on: row.alertOn,
                completed_on: null,
            };
        });

    if (insertRows.length === 0) return;

    const { error: insertError } = await supabase
        .schema("assets")
        .from("reminders")
        .insert(insertRows);

    if (insertError) {
        throw new Error(
            `replaceVehicleReminders insert failed: ${insertError.message}`,
        );
    }
}

// TODO
// export async function softDeleteVehicle(
//     input: SoftDeleteVehicleInput,
// ): Promise<void> {
//     const supabase = await createClient();

//     const { error } = await supabase
//         .schema("assets")
//         .from("vehicles")
//         .update({
//             deleted_at: new Date().toISOString(),
//             deleted_by: input.deletedBy,
//             delete_reason: input.deleteReason ?? null,
//         })
//         .eq("id", input.vehicleId)
//         .is("deleted_at", null);

//     if (error) {
//         throw new Error(`softDeleteVehicle failed: ${error.message}`);
//     }
// }
// export async function restoreVehicle(vehicleId: string): Promise<void> {
//     const supabase = await createClient();

//     const { error } = await supabase
//         .schema("assets")
//         .from("vehicles")
//         .update({
//             deleted_at: null,
//             deleted_by: null,
//             delete_reason: null,
//         })
//         .eq("id", vehicleId)
//         .not("deleted_at", "is", null);

//     if (error) {
//         throw new Error(`restoreVehicle failed: ${error.message}`);
//     }
// }
// export async function checkVehicleHardDelete(
//     vehicleId: string,
// ): Promise<HardDeleteVehicleCheckResult> {
//     const supabase = await createClient();

//     const [
//         { count: reminderCount, error: reminderError },
//         { count: logCount, error: logError },
//     ] = await Promise.all([
//         supabase
//             .schema("assets")
//             .from("reminders")
//             .select("*", { count: "exact", head: true })
//             .eq("target_type", "vehicle")
//             .eq("target_id", vehicleId),
//         supabase
//             .schema("assets")
//             .from("vehicle_renewal_logs")
//             .select("*", { count: "exact", head: true })
//             .eq("vehicle_id", vehicleId),
//     ]);

//     if (reminderError) {
//         throw new Error(
//             `checkVehicleHardDelete reminders failed: ${reminderError.message}`,
//         );
//     }

//     if (logError) {
//         throw new Error(
//             `checkVehicleHardDelete logs failed: ${logError.message}`,
//         );
//     }

//     return {
//         vehicleId,
//         reminderCount: reminderCount ?? 0,
//         renewalLogCount: logCount ?? 0,
//         canHardDelete: (reminderCount ?? 0) === 0 && (logCount ?? 0) === 0,
//     };
// }
// export async function hardDeleteVehicle(vehicleId: string): Promise<void> {
//     const check = await checkVehicleHardDelete(vehicleId);

//     if (!check.canHardDelete) {
//         throw new Error(
//             `この車両は完全削除できません。related reminders=${check.reminderCount}, renewal_logs=${check.renewalLogCount}`,
//         );
//     }

//     const supabase = await createClient();

//     const { error } = await supabase
//         .schema("assets")
//         .from("vehicles")
//         .delete()
//         .eq("id", vehicleId);

//     if (error) {
//         throw new Error(`hardDeleteVehicle failed: ${error.message}`);
//     }
// }


export async function findVehicleLabelOptions<K extends keyof VehicleDetailItem>(
    columnName: K
): Promise<{ id: string; name: string }[]> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from("vehicles")
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
