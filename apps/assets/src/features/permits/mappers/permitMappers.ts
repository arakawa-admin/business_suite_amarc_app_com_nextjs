import type {
    CreatePermitInput,
    PermitDetailRow,
    ReplacePermitRemindersInput,
    UpdatePermitInput,
    PermitReminderViewRow,
} from "../types/permitTypes";
import type {
    PermitFormValues,
    PermitSubmitValues,
} from "../schemas/permitSchema";

function formatDateOnly(value: Date | null | undefined): string | null {
    if (!value) return null;

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function mapPermitRowToFormValues(
    permit: PermitDetailRow,
    reminders: PermitReminderViewRow[] = [],
): Partial<PermitFormValues> {
    return {
        categoryId: permit.category_id,
        subjectName: permit.subject_name,
        businessName: permit.business_name ?? "",
        permitNumber: permit.permit_number ?? "",
        requiredIntervalLabel: permit.required_interval_label ?? "",
        issuedOn: permit.issued_on ? new Date(permit.issued_on) : null,
        requiresPriorCertificate: permit.requires_prior_certificate,
        note: permit.note ?? "",
        reminders: reminders.map((row) => ({
            dueOn: row.due_on ? new Date(row.due_on) : null,
            alertOn: row.alert_on ? new Date(row.alert_on) : null,
        })),
    };
}

export function mapPermitSubmitValuesToCreateInput(
    values: PermitSubmitValues,
): CreatePermitInput {
    return {
        category_id: values.categoryId,
        subject_name: values.subjectName,
        business_name: values.businessName || null,
        permit_number: values.permitNumber || null,
        required_interval_label: values.requiredIntervalLabel || null,
        issued_on: formatDateOnly(values.issuedOn),
        requires_prior_certificate: values.requiresPriorCertificate,
        note: values.note || null,
    };
}

export function mapPermitSubmitValuesToUpdateInput(
    values: PermitSubmitValues,
): UpdatePermitInput {
    return {
        category_id: values.categoryId,
        subject_name: values.subjectName,
        business_name: values.businessName || null,
        permit_number: values.permitNumber || null,
        required_interval_label: values.requiredIntervalLabel || null,
        issued_on: formatDateOnly(values.issuedOn),
        requires_prior_certificate: values.requiresPriorCertificate,
        note: values.note || null,
    };
}

export function mapPermitSubmitValuesToReplaceRemindersInput(
    permitId: string,
    values: PermitSubmitValues,
): ReplacePermitRemindersInput {
    return {
        permitId,
        reminders: values.reminders.map((row) => ({
            dueOn: formatDateOnly(row.dueOn),
            alertOn: formatDateOnly(row.alertOn),
        })),
    };
}
