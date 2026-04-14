import type { FormDefinition } from "../_core/types";
import type { ContractEmploymentInput } from "./zod";

export const contractEmploymentDefinition: FormDefinition<ContractEmploymentInput> = {
    formCode: "contract-employment",
    title: "契約社員雇用継続申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },
        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 }, },

        { name: "target_user_id", type: "staffId", label: "対象者", gridSize: { xs: 12, sm: 6 },
            selectStaffOptions: { validEmployType: "contract" },
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

        { name: "work_place", type: "text", label: "就業場所" },
        { name: "work_content", type: "textarea", label: "仕事内容", rows: 2 },
        { name: "health", type: "textarea", label: "健康状態", rows: 2 },

        { type: "slot", slotKey: "skills", gridSize: { xs: 12 }},
    ]
};
