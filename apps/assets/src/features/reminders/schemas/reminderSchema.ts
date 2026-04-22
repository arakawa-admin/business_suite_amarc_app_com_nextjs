import { z } from "zod";

const optionalText = z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : ""));

export const reminderReminderSchema = z.object({
    dueOn: z.date().nullable().optional(),
    alertOn: z.date().nullable().optional(),
    reminderTypeCode: z
        .enum([
            "reminder_inspection_expiry",
            "reminder_voluntary_insurance_expiry",
        ])
        .optional(),
});

export const uploadedAttachmentItemSchema = z.object({
    attachmentId: z.uuid("attachmentId が不正です"),
    originalFilename: z.string().trim().min(1, "originalFilename は必須です"),
    contentType: z.string().nullable(),
    byteSize: z.number().int().min(0, "byteSize は0以上である必要があります"),
    storageKey: z.string().trim().nullish(),
    previewUrl: z.string().trim().nullish(),
    viewUrl: z.string().trim().nullish(),
});

export type ReminderAttachmentFormValues = z.input<
    typeof uploadedAttachmentItemSchema
>;

export const createReminderSchema = z.object({
    targetType: z.literal("reminder"),
    reminderId: z.string().trim().min(1, "登録番号は必須です"),

    reminderTypeCode: z.string().trim(),
    reminderTypeName: z.string().trim(),

    dueOn: optionalText,
    alertOn: optionalText,
    completedOn: optionalText,
});

export type ReminderFormValues = z.input<typeof createReminderSchema>;
export type ReminderSubmitValues = z.output<typeof createReminderSchema>;

export const reminderFormDefaultValues: ReminderFormValues = {
    targetType: "reminder",
    reminderId: "",

    reminderTypeCode: "",
    reminderTypeName: "",

    dueOn: "",
    alertOn: "",
    completedOn: "",
};
