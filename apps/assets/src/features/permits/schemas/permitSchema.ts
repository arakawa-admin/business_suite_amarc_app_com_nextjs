import { z } from "zod";

const optionalText = z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : ""));

export const permitReminderSchema = z.object({
    dueOn: z.date().nullable().optional(),
    alertOn: z.date().nullable().optional(),
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
export type PermitAttachmentFormValues = z.input<typeof uploadedAttachmentItemSchema>;

export const createPermitSchema = z.object({
    categoryId: z.string().trim().min(1, "分類は必須です"),
    subjectName: z.string().trim().min(1, "対象は必須です"),
    businessName: z.string().trim().min(1, "業は必須です"),
    permitNumber: optionalText,
    requiredIntervalLabel: optionalText,
    issuedOn: z.date().nullable().optional(),
    requiresPriorCertificate: z.boolean().default(false),
    note: optionalText,
    reminders: z.array(permitReminderSchema).default([]),

    attachments: z.array(uploadedAttachmentItemSchema).default([]),
});

export type PermitFormValues = z.input<typeof createPermitSchema>;
export type PermitSubmitValues = z.output<typeof createPermitSchema>;

export const permitFormDefaultValues: PermitFormValues = {
    categoryId: "",
    subjectName: "",
    businessName: "",
    permitNumber: "",
    requiredIntervalLabel: "",
    issuedOn: new Date(),
    requiresPriorCertificate: false,
    note: "",
    reminders: [],
};
