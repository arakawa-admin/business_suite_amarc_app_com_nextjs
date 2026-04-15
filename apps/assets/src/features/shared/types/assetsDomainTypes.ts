export const assetTargetTypes = [
    "permit",
    "permit_renewal_log",
    "vehicle",
    "vehicle_insurance",
    "vehicle_inspection_log",
] as const;

export type AssetTargetType = (typeof assetTargetTypes)[number];

export const attachmentRoles = [
    "general",
    "permit_certificate",
    "insurance_policy",
    "inspection_report",
    "vehicle_photo",
    "other",
] as const;

export type AttachmentRole = (typeof attachmentRoles)[number];

export const reminderTypeCodes = [
    "permit_expiry",
    "permit_alert",
    "permit_submission_deadline",
    "permit_other",
    "vehicle_insurance_expiry",
    "vehicle_inspection_expiry",
    "vehicle_other",
] as const;

export type ReminderTypeCode = (typeof reminderTypeCodes)[number];

export const eventTypeCodes = [
    "permit_created",
    "permit_updated",
    "permit_renewed",
    "vehicle_created",
    "vehicle_updated",
    "insurance_registered",
    "inspection_completed",
    "other",
] as const;

export type EventTypeCode = (typeof eventTypeCodes)[number];
