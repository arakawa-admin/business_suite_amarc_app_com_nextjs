import type { FormDefinition } from "../_core/types";
import type { UseCompanyOwnerVehicleInput } from "./zod";

export const useCompanyOwnerVehicleDefinition: FormDefinition<UseCompanyOwnerVehicleInput> = {
    formCode: "use-company-owner-vehicle",
    title: "社有車使用許可申請",
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

        { name: "destination", type: "text", label: "行き先" },
        { name: "reason", type: "textarea", label: "用途・目的", rows: 2 },
        { name: "car_name", type: "text", label: "車名", gridSize: { xs: 12, sm: 6 }, },
        { name: "car_no", type: "text", label: "車番", gridSize: { xs: 12, sm: 6 }, },

        { name: "is_maintenance", type: "switch", label: "整備状況",
            switchOptions: { label: {true: "整備状況 良好", false: "整備状況 不良"} }
        },
        { name: "maintenance_detail", type: "text", label: "問題の詳細", visibleIf: { name: "is_maintenance", equals: true }, },

        { name: "is_violation", type: "switch", label: "過去１年間の交通事故歴" },
        { name: "operation_years", type: "number", label: "運転歴",
            inputOptions: { endAdornment: "年以上" },
            visibleIf: { name: "is_violation", equals: true },
        },

        { name: "post_files", type: "file", label: "免許証",
            fileOptions: { maxFiles: 2 },
        },
    ]
};
