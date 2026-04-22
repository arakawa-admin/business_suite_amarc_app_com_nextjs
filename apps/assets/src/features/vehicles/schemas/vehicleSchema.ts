import { z } from "zod";

const optionalText = z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : ""));

const optionalNullableText = z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => {
        if (v == null) return "";
        return v.length > 0 ? v : "";
    });

const optionalYearMonthString = z
    .string()
    .trim()
    .nullable()
    .refine(
        (v) => !v || /^\d{4}-(0[1-9]|1[0-2])$/.test(v),
        "初年度登録年月は YYYY-MM 形式で入力してください",
    );

function formatYearMonth(date: Date | null): string | null {
    if (!date) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
}

export const vehicleReminderSchema = z.object({
    dueOn: z.date().nullable().optional(),
    alertOn: z.date().nullable().optional(),
    reminderTypeCode: z
        .enum([
            "vehicle_inspection_expiry",
            "vehicle_voluntary_insurance_expiry",
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

export type VehicleAttachmentFormValues = z.input<
    typeof uploadedAttachmentItemSchema
>;

export const createVehicleSchema = z.object({
    registrationNumber: z.string().trim().min(1, "登録番号は必須です"),

    departmentId: z.string().trim().min(1, "使用部門は必須です"),

    manufacturerName: optionalText,
    vehicleName: optionalText,
    typeName: optionalText,
    model: optionalText,
    serialNumber: optionalText,

    firstRegisteredYm: z
        .date()
        .transform((value) => formatYearMonth(value)),

    ownerName: optionalText,
    isFixedAsset: z.boolean().default(false),
    isRegistered: z.boolean().default(true),

    voluntaryInsuranceAgencyId: z.string().trim().min(1, "任意保険会社は必須です"),
    compulsoryInsuranceAgencyName: optionalText,
    note: optionalText,

    reminders: z.array(vehicleReminderSchema).default([]),
    attachments: z.array(uploadedAttachmentItemSchema).default([]),
});

export const vehicleSubmitSchema = z.object({
    registrationNumber: z.string().trim().min(1, "登録番号は必須です"),

    departmentId: z.string().trim(),
    // optionalNullableText,

    manufacturerName: optionalNullableText,
    vehicleName: optionalNullableText,
    typeName: optionalNullableText,
    model: optionalNullableText,
    serialNumber: optionalNullableText,

    firstRegisteredYm: optionalYearMonthString,

    ownerName: optionalNullableText,
    isFixedAsset: z.boolean().default(false),
    isRegistered: z.boolean().default(true),

    voluntaryInsuranceAgencyId: z.string().trim(),
    // optionalNullableText,
    compulsoryInsuranceAgencyName: optionalNullableText,
    note: optionalNullableText,

    reminders: z.array(vehicleReminderSchema).default([]),
    attachments: z.array(uploadedAttachmentItemSchema).default([]),
});

export type VehicleFormValues = z.input<typeof createVehicleSchema>;
export type VehicleSubmitValues = z.output<typeof createVehicleSchema>;
export type VehicleServerValues = z.output<typeof vehicleSubmitSchema>;

export const vehicleFormDefaultValues: VehicleFormValues = {
    registrationNumber: "",
    departmentId: "",
    manufacturerName: "",
    vehicleName: "",
    typeName: "",
    model: "",
    serialNumber: "",
    firstRegisteredYm: new Date(),
    ownerName: "",
    isFixedAsset: false,
    isRegistered: true,
    voluntaryInsuranceAgencyId: "",
    compulsoryInsuranceAgencyName: "",
    note: "",
    reminders: [],
    attachments: [],
};
