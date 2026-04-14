import type { FormDefinition } from "../_core/types";
import type { UsePrivatelyOwnerVehicleInput } from "./zod";

export const usePrivatelyOwnerVehicleDefinition: FormDefinition<UsePrivatelyOwnerVehicleInput> = {
    formCode: "use-privately-owner-vehicle",
    title: "個人所有車業務使用許可申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },

        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 },
            display: { gridSize: 12 }
        },

        {
            type: "dateRange",
            disabled: false,
            label: "使用期間",
            dateRangeOptions: {
                fromName: "start_date",
                toName: "end_date",
                labelStart: "使用開始日",
                labelEnd: "使用終了日",
                minDate: new Date(),
                maxDate: new Date("2050-12-31"),
                granularity: "day",
            },
        },

        { name: "reason", type: "textarea", label: "用途・目的", rows: 2 },
        { name: "car_name", type: "text", label: "車名", gridSize: { xs: 12, sm: 6 }, },
        { name: "car_no", type: "text", label: "車番", gridSize: { xs: 12, sm: 6 }, },

        { name: "owner", type: "text", label: "所有者", gridSize: { xs: 12, sm: 6 }, },
        { name: "target_user_id", type: "staffId", label: "使用者",  gridSize: { xs: 12, sm: 6 },
            display: { labelPath: "target_user.name" }
        },

        { name: "is_liability_insurance", type: "switch", label: "自賠責保険 加入状況",
            switchOptions: { label: {true: "自賠責保険 加入", false: "自賠責保険 未加入"} }
        },
        { type: "dateRange", disabled: false, label: "任意保険 加入状況",
            dateRangeOptions: {
                fromName: "insurance_start_date",
                toName: "insurance_end_date",
                labelStart: "任意保険 契約開始日",
                labelEnd: "任意保険 契約終了日",
                minDate: new Date(),
                maxDate: new Date("2050-12-31"),
                granularity: "day",
            },
        },

        {
            name: "personal_insurance", type: "select", label: "対人保険", disabled: false,
            selectOptions: {
                items: [
                    "無制限", "〜1,000万円", "〜2,000万円", "〜3,000万円", "〜4,000万円", "〜5,000万円",
                    "〜6,000万円", "〜7,000万円", "〜8,000万円", "〜9,000万円", "〜1億万円", "決裁中"
                ].map((v) => ({ id: v, name: v })),
            }, gridSize: { xs: 12, sm: 6, md: 4 }
        },
        {
            name: "property_insurance", type: "select", label: "対物保険", disabled: false,
            selectOptions: {
                items: [
                    "無制限", "〜1,000万円", "〜2,000万円", "〜3,000万円", "〜4,000万円", "〜5,000万円",
                    "〜6,000万円", "〜7,000万円", "〜8,000万円", "〜9,000万円", "〜1億万円", "決裁中"
                ].map((v) => ({ id: v, name: v })),
            }, gridSize: { xs: 12, sm: 6, md: 4 }
        },
        {
            name: "passenger_insurance", type: "select", label: "搭乗者保険", disabled: false,
            selectOptions: {
                items: [
                    "無制限", "〜1,000万円", "〜2,000万円", "〜3,000万円", "〜4,000万円", "〜5,000万円",
                    "〜6,000万円", "〜7,000万円", "〜8,000万円", "〜9,000万円", "〜1億万円", "決裁中"
                ].map((v) => ({ id: v, name: v })),
            }, gridSize: { xs: 12, sm: 6, md: 4 }
        },

        { name: "is_maintenance", type: "switch", label: "整備状況",
            switchOptions: { label: {true: "整備状況 良好", false: "整備状況 不良"} }
        },
        { name: "maintenance_detail", type: "text", label: "問題の詳細", visibleIf: { name: "is_maintenance", equals: true }, },

        { name: "is_violation", type: "switch", label: "重大な交通事故・違反歴の確認",
            switchOptions: { label: {true: "重大な交通事故・違反歴の確認: 済", false: "重大な交通事故・違反歴の確認: 未"} }
        },

        { name: "license_file", type: "file", label: "免許証", fileOptions: { maxFiles: 1, previewSize: 12 }, gridSize: { xs: 12, sm: 6, md: 4 },
            display: { visible: false }
        },
        { type: "slot", slotKey: "license", label: "免許", display: { gridSize: { xs: 12, sm: 6, md: 4 } } },

        { name: "inspection_file", type: "file", label: "車検証", fileOptions: { maxFiles: 1, previewSize: 12 }, gridSize: { xs: 12, sm: 6, md: 4 },
            display: { visible: false }
        },
        { type: "slot", slotKey: "inspection", label: "車検証", display: { gridSize: { xs: 12, sm: 6, md: 4 } } },

        { name: "insurance_file", type: "file", label: "任意保険証", fileOptions: { maxFiles: 1, previewSize: 12 }, gridSize: { xs: 12, sm: 6, md: 4 },
            display: { visible: false }
        },
        { type: "slot", slotKey: "insurance", label: "任意保険証", display: { gridSize: { xs: 12, sm: 6, md: 4 } } },
    ]
};
