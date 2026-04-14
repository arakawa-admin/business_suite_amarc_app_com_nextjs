import type { FormDefinition } from "../_core/types";
import type { ChangeProfileInput } from "./zod";

export const changeProfileDefinition: FormDefinition<ChangeProfileInput> = {
    formCode: "change-profile",
    title: "変更届",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false },
        },

        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 },
            display: { gridSize: 6 },
        },

        { name: "change_date", type: "date", label: "変更年月日",
            display: { gridSize: 6 },
        },
        { name: "reason", type: "textarea", label: "変更理由", rows: 3 },

        { name: "is_name_change", type: "switch", label: "名前変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "名前変更",
            visibleIf: { name: "is_name_change", equals: true },
            fields: [
                { name: "name_before", type: "text", label: "名前(変更前)", visibleIf: { name: "is_name_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "name_after", type: "text", label: "名前(変更後)", visibleIf: { name: "is_name_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "kana_before", type: "text", label: "カナ(変更前)", visibleIf: { name: "is_name_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "kana_after", type: "text", label: "カナ(変更後)", visibleIf: { name: "is_name_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
            ],
        },

        { name: "is_address_change", type: "switch", label: "住所変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "住所変更",
            visibleIf: { name: "is_address_change", equals: true },
            fields: [
                { name: "zipcode_before", type: "text", label: "郵便番号(変更前)", visibleIf: { name: "is_address_change", equals: true },
                    gridSize: { xs: 12, sm: 6 },
                    display: { formatter: "zipcode" },
                },
                { name: "zipcode_after", type: "text", label: "郵便番号(変更後)", visibleIf: { name: "is_address_change", equals: true }, gridSize: { xs: 12, sm: 6 },
                    display: { formatter: "zipcode" },
            },
                { name: "address_before", type: "text", label: "住所(変更前)", visibleIf: { name: "is_address_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "address_after", type: "text", label: "住所(変更後)", visibleIf: { name: "is_address_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
            ],
        },

        { name: "is_distance_change", type: "switch", label: "通勤距離変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "通勤距離変更",
            visibleIf: { name: "is_distance_change", equals: true },
            fields: [
                { name: "distance_before", type: "text", label: "通勤距離(変更前)", inputOptions: { endAdornment: "km" }, visibleIf: { name: "is_distance_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "distance_after", type: "text", label: "通勤距離(変更後)", inputOptions: { endAdornment: "km" }, visibleIf: { name: "is_distance_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
            ]
        },

        { name: "is_tel_change", type: "switch", label: "電話番号変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "電話番号変更",
            visibleIf: { name: "is_tel_change", equals: true },
            fields: [
                { name: "tel_before", type: "text", label: "電話番号(変更前)", visibleIf: { name: "is_tel_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "tel_after", type: "text", label: "電話番号(変更後)", visibleIf: { name: "is_tel_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
            ]
        },

        { name: "is_mobile_change", type: "switch", label: "携帯番号変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "携帯番号変更",
            visibleIf: { name: "is_mobile_change", equals: true },
            fields: [
                { name: "mobile_before", type: "text", label: "携帯番号(変更前)", visibleIf: { name: "is_mobile_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "mobile_after", type: "text", label: "携帯番号(変更後)", visibleIf: { name: "is_mobile_change", equals: true }, gridSize: { xs: 12, sm: 6 } },
            ]
        },

        { name: "is_emergency_contacts_change", type: "switch", label: "緊急連絡先変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "緊急連絡先変更",
            visibleIf: { name: "is_emergency_contacts_change", equals: true },
            fields: [
                { type: "slot", slotKey: "emergency_contacts", gridSize: { xs: 12 }, visibleIf: { name: "is_emergency_contacts_change", equals: true } },
            ]
        },

        { name: "is_bank_account", type: "switch", label: "銀行口座変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "銀行口座変更",
            visibleIf: { name: "is_bank_account", equals: true },
            fields: [
                { name: "bank_before", type: "radio", label: "銀行(変更前)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 },
                    radioOptions: {
                        row: true,
                        items: [{ id: "toho", name: "東邦銀行" }, { id: "sinkin", name: "会津信用金庫" }, { id: "other", name: "その他" }],
                    }
                },
                { name: "bank_after", type: "radio", label: "銀行(変更前)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 },
                    radioOptions: {
                        row: true,
                        items: [{ id: "toho", name: "東邦銀行" }, { id: "sinkin", name: "会津信用金庫" }, { id: "other", name: "その他" }],
                    }
                },
                { name: "branch_before", type: "text", label: "支店(変更前)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "branch_after", type: "text", label: "支店(変更後)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "account_no_before", type: "text", label: "口座番号(変更前)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "account_no_after", type: "text", label: "口座番号(変更後)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "account_name_before", type: "text", label: "口座名義(変更前)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 } },
                { name: "account_name_after", type: "text", label: "口座名義(変更後)", visibleIf: { name: "is_bank_account", equals: true }, gridSize: { xs: 12, sm: 6 } },
            ]
        },

        { name: "is_dependent_change", type: "switch", label: "扶養変更",
            display: { visible: false }
        },
        {
            type: "group",
            label: "扶養変更",
            visibleIf: { name: "is_dependent_change", equals: true },
            fields: [
                { type: "slot", slotKey: "dependents", gridSize: { xs: 12 }, visibleIf: { name: "is_dependent_change", equals: true } },
            ]
        },
    ]
};
