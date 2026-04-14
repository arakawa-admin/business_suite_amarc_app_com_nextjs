import type { FormDefinition } from "../_core/types";
import type { ReEmploymentInput } from "./zod";

export const reEmploymentDefinition: FormDefinition<ReEmploymentInput> = {
    formCode: "re-employment",
    title: "再雇用希望申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },
        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 } },

        { name: "target_user_id", type: "staffId", label: "対象者", gridSize: { xs: 12, sm: 6 },
            display: { labelPath: "target_user.name" }
    },

        { name: "employ_deadline", type: "date", label: "雇用満了日" },

        { name: "is_fulltime_days", type: "switch", label: "勤務日数について",
            switchOptions: { title: "勤務日数について", label: {true: "正社員と同勤務日数を希望する", false: "正社員と同勤務日数を希望しない"} }
        },
        { name: "working_days", type: "text", label: "希望勤務日数", visibleIf: { name: "is_fulltime_days", equals: true }, gridSize: { xs: 12, sm: 6, md: 4 },
            inputOptions: { endAdornment: "日/週" },
            display: { gridSize: 12 }
        },

        { name: "is_fulltime_hours", type: "switch", label: "勤務時間について",
            switchOptions: { title: "勤務時間について", label: {true: "正社員と同勤務時間を希望する", false: "正社員と同勤務時間を希望しない"} }
        },
        { name: "working_hours", type: "text", label: "希望勤務時間", visibleIf: { name: "is_fulltime_hours", equals: true }, gridSize: { xs: 12, sm: 6, md: 4 },
            inputOptions: { endAdornment: "時間/日" },
            display: { gridSize: 12 }
        },

        { name: "is_working_place", type: "switch", label: "勤務地について",
            switchOptions: { title: "勤務地について", label: {true: "現在と同勤務地を希望する", false: "現在と同勤務地を希望しない"} }
        },
        { name: "working_place", type: "text", label: "希望勤務地", visibleIf: { name: "is_working_place", equals: true }, gridSize: { xs: 12, sm: 6, md: 4 },
            display: { gridSize: 12 }
        },

        { name: "assessment", type: "radio", label: "評価",
            radioOptions: {
                row: true,
                items: ["正社員と同様に実施する", "実施しない(パート雇用)"].map((v) => ({ id: v, name: v })),
            }
        },

        { name: "remarks", type: "textarea", label: "備考", rows: 3 },

        {
            type: "slot",
            slotKey: "agreeTerms",
        }
    ]
};
