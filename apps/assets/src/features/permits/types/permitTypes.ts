export type PermitListRow = {
    id: string;
    category_id: string;
    category_name: string;
    category_sort_order: number;
    subject_name: string;
    business_name: string | null;
    permit_number: string | null;
    issued_on: string | null;
    expiry_on: string | null;
    required_interval_label: string | null;
    calculated_status_code: "unknown" | "expired" | "alert_due" | "active";
    calculated_status_name: "不明" | "期限切れ" | "期限近い" | "有効";
    created_at: string;
    updated_at: string;
};

export type PermitDetailRow = {
    id: string;
    category_id: string;
    category_name: string;
    category_sort_order: number;
    subject_name: string;
    business_name: string | null;
    permit_number: string | null;
    required_interval_label: string | null;
    issued_on: string | null;
    requires_prior_certificate: boolean;
    note: string | null;
    created_at: string;
    created_by: string | null;
    created_by_name?: string | null;
    updated_at: string;
    updated_by: string | null;
    updated_by_name?: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    deleted_by_name?: string | null;
    delete_reason?: string | null;
};

export type PermitReminderViewRow = {
    id: string;
    target_type: "permit";
    permit_id: string;
    category_id: string;
    category_name: string;
    subject_name: string;
    business_name: string | null;
    permit_number: string | null;
    required_interval_label: string | null;
    issued_on: string | null;
    requires_prior_certificate: boolean;
    permit_note: string | null;
    reminder_type_code: string;
    reminder_type_name: string;
    due_on: string | null;
    alert_on: string | null;
    completed_on: string | null;
    // status_code: string;
    // status_name: string;
    reminder_memo: string | null;
    created_at: string;
    updated_at: string;
};

export type CreatePermitInput = {
    category_id: string;
    // category_name: string;
    subject_name: string;
    business_name: string | null;
    permit_number: string | null;
    required_interval_label: string | null;
    issued_on: string | null;
    requires_prior_certificate: boolean;
    note: string | null;
};

export type UpdatePermitInput = {
    category_id: string;
    // category_name: string;
    subject_name: string;
    business_name: string | null;
    permit_number: string | null;
    required_interval_label: string | null;
    issued_on: string | null;
    requires_prior_certificate: boolean;
    note: string | null;
};

export type ReplacePermitRemindersInput = {
    permitId: string;
    reminders: {
        dueOn: string | null;
        alertOn: string | null;
    }[];
};

export type SoftDeletePermitInput = {
    permitId: string;
    deletedBy: string;
    deleteReason?: string | null;
};

export type HardDeletePermitCheckResult = {
    permitId: string;
    reminderCount: number;
    renewalLogCount: number;
    canHardDelete: boolean;
};
