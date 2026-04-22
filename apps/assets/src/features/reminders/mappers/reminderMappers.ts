import type {
    ReminderFormValues,
} from "../schemas/reminderSchema";
import type {
    CreateReminderInput,
} from "../types/reminderTypes";

export function mapReminderRowToFormValues(
    reminder: CreateReminderInput,
): Partial<ReminderFormValues> {
    return {
        targetType: "reminder",
        reminderId: reminder.reminder_id ?? "",
        reminderTypeCode: reminder.reminder_type_code ?? "",
        reminderTypeName: reminder.reminder_type_name,
        dueOn: reminder.due_on ?? "",
        alertOn: reminder.alert_on ?? "",
        completedOn: reminder.completed_on ?? "",
    };
}
