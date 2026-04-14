import { z } from "zod";

function emptyToNull(value: unknown) {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

const nullableTrimmedString = z.preprocess(
    emptyToNull,
    z.string().trim().nullable(),
);

export const masterCommonSchema = z
    .object({
        code: z
            .string()
            .trim()
            .min(1, "コードは必須です")
            .max(50, "コードは50文字以内で入力してください"),
        name: z
            .string()
            .trim()
            .min(1, "名称は必須です")
            .max(100, "名称は100文字以内で入力してください"),
        sortOrder: z.coerce
            .number()
            .int("表示順は整数で入力してください")
            .min(0, "表示順は0以上で入力してください"),
        remarks: z
            .string()
            .trim()
            .max(1000, "備考は1000文字以内で入力してください")
            .default(""),
        validAt: nullableTrimmedString,
        invalidAt: nullableTrimmedString,
    })
    .superRefine((value, ctx) => {
        if (value.validAt && value.invalidAt) {
            const validAt = new Date(value.validAt).getTime();
            const invalidAt = new Date(value.invalidAt).getTime();

            if (Number.isNaN(validAt)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["validAt"],
                    message: "有効開始日時の形式が不正です",
                });
            }

            if (Number.isNaN(invalidAt)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["invalidAt"],
                    message: "有効終了日時の形式が不正です",
                });
            }

            if (
                !Number.isNaN(validAt) &&
                !Number.isNaN(invalidAt) &&
                validAt > invalidAt
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["invalidAt"],
                    message: "有効終了日時は有効開始日時以降を指定してください",
                });
            }
        }
    });

export type MasterCommonSchemaInput = z.input<typeof masterCommonSchema>;
export type MasterCommonSchemaOutput = z.output<typeof masterCommonSchema>;
