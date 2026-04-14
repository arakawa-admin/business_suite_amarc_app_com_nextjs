import type { FormDefinition } from "../_core/types";
import type { PartTimeEmploymentInput } from "./zod";

export const partTimeEmploymentDefinition: FormDefinition<PartTimeEmploymentInput> = {
    formCode: "part-time-employment",
    title: "パート社員雇用継続申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },
        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 } },

        { name: "target_user_id", type: "staffId", label: "対象者", gridSize: { xs: 12, sm: 6 },
            selectStaffOptions: { validEmployType: "parttime" },
            display: { labelPath: "target_user.name" }
        },

        {
            type: "dateRange",
            label: "雇用期間",
            disabled: false,
            dateRangeOptions: {
                fromName: "employ_start_date",
                toName: "employ_deadline_date",
                labelStart: "雇用開始日",
                labelEnd: "雇用満了日",
                minDate: new Date(),
                maxDate: new Date("2050-12-31"),
                granularity: "day",
            },
        },
        { name: "employ_type", type: "radio", label: "雇用形態",
            radioOptions: {
                row: true,
                items: [{ id: "full", name: "フルタイム" }, { id: "time", name: "時間制" }, { id: "other", name: "その他" }],
            }
        },
        {
            name: "workdays", type: "multiSelect", label: "勤務曜日", disabled: false, visibleIf: { name: "employ_type", equals: "time" },
            selectOptions: {
                items: [{ id: "mon", name: "月曜日" },{ id: "tue", name: "火曜日" },{ id: "wed", name: "水曜日" },{ id: "thu", name: "木曜日" },{ id: "fri", name: "金曜日" },{ id: "sat", name: "土曜日" },{ id: "sun", name: "日曜日" },],
            }
        },
        {
            type: "timeRange", label: "勤務時間", disabled: false, visibleIf: { name: "employ_type", equals: "time" },
            timeRangeOptions: {
                startName: "start_worktime",
                endName: "end_worktime",
                labelStart: "出勤時間",
                labelEnd: "退勤時間",
            }
        },
        { type: "slot", slotKey: "breaktimes", gridSize: { xs: 12 }, visibleIf: { name: "employ_type", equals: "time" }},

        { name: "other_reason", type: "textarea", label: "理由", rows: 2, visibleIf: { name: "employ_type", equals: "other" } },

        { name: "work_place", type: "text", label: "就業場所" },
        { name: "work_content", type: "textarea", label: "仕事内容", rows: 2 },
        { name: "health", type: "textarea", label: "健康状態", rows: 2 },

        { type: "slot", slotKey: "skills", gridSize: { xs: 12 }},
    ]
};
