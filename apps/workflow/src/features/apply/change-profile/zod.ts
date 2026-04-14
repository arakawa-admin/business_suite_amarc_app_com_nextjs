import { z } from "zod";
import moji from "moji";
import { applicationWithRevisionsSchema, } from "@/schemas/apply/applicationSchema";
import { applicationRevisionFromDbSchema } from "@/schemas/apply/applicationRevisionSchema";

// 半角カナ → 全角カナ、半角/全角スペースは全角スペースに寄せる（任意）
const normalizeKana = (s: string) =>
    moji(s)
        .convert("HK", "ZK") // 半角ｶﾅ -> 全角カナ
        .convert("HS", "ZS") // 半角記号/スペース -> 全角（空白を全角に寄せたい場合）
        .toString()
        .replace(/ /g, "　")  // 半角スペース → 全角スペース（任意）
        .trim();

const kanaSchema = z.preprocess(
    (v) => {
        if (typeof v !== "string") return v;
        const s = normalizeKana(v);        // 半角→全角など
        if (s.length === 0) return undefined; // ← 空なら除外（optionalが効く）
        return s;
    },
    z.string()
        // ✅ 全角カタカナ + 長音 + 全角スペースのみ
        .regex(/^[ァ-ヶー　]+$/, "カタカナで入力してください")
        .max(100)
        .optional()
);

const optionalTrimmed = <S extends z.ZodTypeAny>(schema: S) =>
    z.preprocess(
        (v) => {
            if (v === "" || v == null) return undefined;
            if (typeof v === "string" && v.trim() === "") return undefined;
            return v;
        },
        schema.optional()
);
const jpLandline = z.string().trim().regex(
    /^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/,
    "無効な電話番号形式です（例: 0241-34-5678 または 0241345678）"
);
const jpMobile = z.string().trim().regex(
    /^(0[789]0-\d{4}-\d{4}|0[789]0\d{8})$/,
    "無効な携帯電話番号形式です（例: 090-1234-5678 または 09012345678）"
);
const optionalJpLandline = optionalTrimmed(jpLandline);
const optionalJpMobile = optionalTrimmed(jpMobile);

const optionalNumber1dp = z.preprocess(
    (v) => {
        if (v === "" || v === null || v === undefined) return undefined;
        if (typeof v === "string" && v.trim() === "") return undefined;
        return v;
    },
    z.coerce
        .number("数字を入力して下さい")
        .multipleOf(0.1, "小数第1位までで入力してください")
        .max(1000, "1000km以内で入力してください")
        .optional()
);

const optionalJpZip = z.preprocess(
    (v) => {
        if (v === "" || v == null) return undefined;
        if (typeof v === "string" && v.trim() === "") return undefined;
        return v;
    },
    z.string().regex(/^\d{3}-?\d{4}$/, "郵便番号の形式が不正です").optional()
);

export const emergencyContactSchema = z.object({
    name_before: z.string().trim().max(100).optional(),
    name_after: z.string().trim().max(100).optional(),

    relation_before: z.string().trim().max(50).optional(),
    relation_after: z.string().trim().max(50).optional(),

    phone_before: optionalJpLandline.or(optionalJpMobile),
    phone_after: optionalJpLandline.or(optionalJpMobile),
});

export const dependentSchema = z.object({
    is_add_dependent: z.boolean().default(true),
    name: z.string().trim().max(100).optional(),
    kana: kanaSchema,
    birthday: z.instanceof(Date, {message: "日付を入力して下さい"}),
    gender: z.string().trim().max(50).optional(),
    relation: z.string().trim().max(50).optional(),
    residence: z.string().trim().max(10).optional(),
    zipcode: optionalJpZip,
    address: z.string().trim().max(100).optional(),
});

// HTML input[type=date] は "YYYY-MM-DD" 文字列で来る想定
export const changeProfileSchema = z.object({
    author_id: z.string().min(1, "申請者を選択して下さい"),
    department_id: z.string().min(1, "部門を選択して下さい"),

    change_date: z.instanceof(Date, {message: "日付を入力して下さい"}),
    reason: z.string().min(1, "変更理由を入力してください").max(1000, "変更理由は1000文字以内で入力してください"),

    is_name_change: z.boolean().default(false),
    name_before: z.string().max(100, "100文字以内で入力してください").optional(),
    name_after: z.string().max(100, "100文字以内で入力してください").optional(),
    kana_before: kanaSchema,
    kana_after: kanaSchema,

    is_address_change: z.boolean().default(false),
    address_before: z.string().max(100, "100文字以内で入力してください").optional(),
    address_after: z.string().max(100, "100文字以内で入力してください").optional(),
    zipcode_before: optionalJpZip,
    zipcode_after: optionalJpZip,

    is_distance_change: z.boolean().default(false),
    distance_before: optionalNumber1dp,
    distance_after: optionalNumber1dp,

    is_tel_change: z.boolean().default(false),
    tel_before: optionalJpLandline,
    tel_after: optionalJpLandline,

    is_mobile_change: z.boolean().default(false),
    mobile_before: optionalJpMobile,
    mobile_after: optionalJpMobile,

    is_emergency_contacts_change: z.boolean().default(false),
    emergency_contacts: z.array(emergencyContactSchema).default([]),

    is_bank_account: z.boolean().default(false),
    bank_before: z.string().max(10, "10文字以内で入力してください").optional(),
    branch_before: z.string().max(100, "100文字以内で入力してください").optional(),
    account_no_before: z.string().max(10, "10文字以内で入力してください").optional(),
    account_name_before: z.string().max(100, "100文字以内で入力してください").optional(),
    bank_after: z.string().max(10, "10文字以内で入力してください").optional(),
    branch_after: z.string().max(100, "100文字以内で入力してください").optional(),
    account_no_after: z.string().max(10, "10文字以内で入力してください").optional(),
    account_name_after: z.string().max(100, "100文字以内で入力してください").optional(),

    is_dependent_change: z.boolean().default(false),
    dependents: z.array(dependentSchema).default([]),
})
.superRefine((val, ctx) => {
    // 共通：空チェック関数
    const requireNonEmpty = (key: keyof typeof val, message: string) => {
        const v = val[key];
        const isEmpty =
            v === undefined ||
            v === null ||
            (typeof v === "string" && v.trim() === "") ||
            (typeof v === "number" && Number.isNaN(v));

        if (isEmpty) {
            ctx.addIssue({
                code: "custom",
                path: [key],
                message,
            });
        }
    };

    if (val.is_name_change) {
        const msg = "名前変更がONのときは入力してください";
        requireNonEmpty("name_before", msg);
        requireNonEmpty("kana_before", msg);
        requireNonEmpty("name_after", msg);
        requireNonEmpty("kana_after", msg);
    }

    if (val.is_address_change) {
        const msg = "アドレス変更がONのときは入力してください";
        requireNonEmpty("address_before", msg);
        requireNonEmpty("zipcode_before", msg);
        requireNonEmpty("address_after", msg);
        requireNonEmpty("zipcode_after", msg);
    }

    if (val.is_distance_change) {
        const msg = "通勤距離変更がONのときは入力してください";
        requireNonEmpty("distance_before", msg);
        requireNonEmpty("distance_after", msg);
    }

    if (val.is_tel_change) {
        const msg = "電話番号変更がONのときは入力してください";
        requireNonEmpty("tel_before", msg);
        requireNonEmpty("tel_after", msg);
    }

    if (val.is_mobile_change) {
        const msg = "携帯番号変更がONのときは入力してください";
        requireNonEmpty("mobile_before", msg);
        requireNonEmpty("mobile_after", msg);
    }

    if (val.is_emergency_contacts_change) {
        if (!val.emergency_contacts || val.emergency_contacts.length === 0) {
            ctx.addIssue({
                code: "custom",
                path: ["emergency_contacts"],
                message: "緊急連絡先を1件以上入力してください",
            });
        }
        // 各行の phone を必須化（空ならエラー）
        val.emergency_contacts.forEach((row, i) => {
            const requireStr = (v: unknown) => typeof v === "string" && v.trim() !== "";
            if (!requireStr(row.name_before)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["emergency_contacts", i, "name_before"],
                    message: "氏名(変更前)を入力してください",
                });
            }
            if (!requireStr(row.name_after)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["emergency_contacts", i, "name_after"],
                    message: "氏名(変更後)を入力してください",
                });
            }
            if (!requireStr(row.relation_before)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["emergency_contacts", i, "relation_before"],
                    message: "続柄(変更前)を選択してください",
                });
            }
            if (!requireStr(row.relation_after)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["emergency_contacts", i, "relation_after"],
                    message: "続柄(変更後)を選択してください",
                });
            }
            if (!requireStr(row.phone_before)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["emergency_contacts", i, "phone_before"],
                    message: "電話番号(変更前)を入力してください",
                });
            }
            if (!requireStr(row.phone_after)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["emergency_contacts", i, "phone_after"],
                    message: "電話番号(変更後)を入力してください",
                });
            }
        });
    }

    if (val.is_bank_account) {
        const msg = "銀行口座変更がONのときは入力してください";
        requireNonEmpty("bank_before", msg);
        requireNonEmpty("bank_after", msg);
        requireNonEmpty("branch_before", msg);
        requireNonEmpty("branch_after", msg);
        requireNonEmpty("account_no_before", msg);
        requireNonEmpty("account_no_after", msg);
        requireNonEmpty("account_name_before", msg);
        requireNonEmpty("account_name_after", msg);
    }

    if (val.is_dependent_change) {
        if (!val.dependents || val.dependents.length === 0) {
            ctx.addIssue({
                code: "custom",
                path: ["dependents"],
                message: "扶養を1件以上入力してください",
            });
        }
        val.dependents.forEach((row, i) => {
            const requireStr = (v: unknown) => typeof v === "string" && v.trim() !== "";
            if (!requireStr(row.name)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "name"],
                    message: "名前を入力してください",
                });
            }
            if (!requireStr(row.kana)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "kana"],
                    message: "カナを入力してください",
                });
            }
            if (!row.birthday) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "birthday"],
                    message: "誕生日を入力してください",
                });
            }
            if (!requireStr(row.gender)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "gender"],
                    message: "性別を入力してください",
                });
            }
            if (!requireStr(row.relation)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "relation"],
                    message: "続柄を選択してください",
                });
            }
            if (!requireStr(row.residence)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "residence"],
                    message: "居住を選択してください",
                });
            }
            if (!requireStr(row.zipcode)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "zipcode"],
                    message: "郵便番号を入力してください",
                });
            }
            if (!requireStr(row.address)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dependents", i, "address"],
                    message: "住所を入力してください",
                });
            }
        });
    }



    if (!(val.is_name_change
        || val.is_address_change
        || val.is_distance_change
        || val.is_tel_change
        || val.is_mobile_change
        || val.is_emergency_contacts_change
        || val.is_bank_account
        || val.is_dependent_change)) {
        ctx.addIssue({
            code: "custom",
            path: ["is_name_change"],
            message: "項目を1件以上選択してください",
        });
    }
});

export type ChangeProfileInput = z.infer<typeof changeProfileSchema>;


export const applicationWithRevisionsOverridePayloadSchema = z.object({
    ...applicationWithRevisionsSchema.shape,
    application_revisions: z.array(
        applicationRevisionFromDbSchema.extend({
            payload: changeProfileSchema,
        })
    ),
})
export type applicationWithRevisionsOverridePayloadType = z.infer<typeof applicationWithRevisionsOverridePayloadSchema>;

