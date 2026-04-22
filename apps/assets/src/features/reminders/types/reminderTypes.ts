export type Reminder = {
    id: string;
    targetType: string;
    targetId: string;
    reminderTypeCode: string;
    reminderTypeName: string;

    dueOn?: string;
    alertOn?: string;
    completedOn?: string;

    createdAt: string;
    deletedBy: string | null;
    updatedAt: string;
    updatedBy: string | null;
};

export type CreateReminderInput = {
    id: string;
    target_type: "reminder";
    reminder_id: string;
    reminder_type_code: string;
    reminder_type_name: string;
    due_on: string | null;
    alert_on: string | null;
    completed_on: string | null;
};

export type CommentListItem = {
    id: string;
    target_type: "reminder";
    target_id: string;
    body: string;
    source_type: "detail" | "email_link" | "manual" | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    created_by_name: string | null;
    updated_by_name: string | null;
};
