import type { FormDefinition } from "../_core/types";
import type { EndTrialEmploymentInput } from "./zod";

export const endTrialEmploymentDefinition: FormDefinition<EndTrialEmploymentInput> = {
    formCode: "end-trial-employment",
    title: "試用期間満了申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },

        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 } },

        { name: "target_user_id", type: "staffId", label: "対象者", gridSize: { xs: 12, sm: 6 },
            selectStaffOptions: { validEmployType: "trial" },
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

        {
            name: "trial_deadline",
            type: "date",
            disabled: true,
            label: "試用期間満了日"
        },

        {
            type: "timeRange",
            label: "面談時間",
            disabled: false,
            timeRangeOptions: {
                startName: "interview_start_time",
                endName: "interview_end_time",
                labelStart: "面談開始時間",
                labelEnd: "面談終了時間",
            }
        },

        { name: "is_perfect_attendance", type: "switch", label: "皆勤状況",
            switchOptions: { label: {true: "皆勤である", false: "皆勤でない"} }
        },
        { name: "absentee_days", type: "text", label: "欠勤日数", visibleIf: { name: "is_perfect_attendance", equals: false }, gridSize: { xs: 12, sm: 6, md: 4 },
            inputOptions: { endAdornment: "日" }
        },
        { name: "early_leave_times", type: "text", label: "早退時間", visibleIf: { name: "is_perfect_attendance", equals: false }, gridSize: { xs: 12, sm: 6, md: 4 },
            inputOptions: { endAdornment: "時間" }
        },
        { name: "late_times", type: "text", label: "遅刻時間", visibleIf: { name: "is_perfect_attendance", equals: false }, gridSize: { xs: 12, sm: 6, md: 4 },
            inputOptions: { endAdornment: "時間" } },

        { name: "is_disaster", type: "switch", label: "災害状況",
            switchOptions: { label: {true: "無災害である", false: "無災害でない"} }
        },
        { name: "nonstop_disaster", type: "text", label: "不休災害", visibleIf: { name: "is_disaster", equals: false }, gridSize: { xs: 12, sm: 6, md: 4 },
            inputOptions: { endAdornment: "件" }
        },
        { name: "hiyari_disaster", type: "text", label: "ヒヤリ災害", visibleIf: { name: "is_disaster", equals: false }, gridSize: { xs: 12, sm: 6, md: 4 },
            inputOptions: { endAdornment: "件" }
        },

        { name: "attitude", type: "radio", label: "業務遂行態度",
            radioOptions: {
                row: true,
                items: ["非常に良い", "良い", "普通", "やや劣る", "劣る"].map((v) => ({ id: v, name: v })),
            }
        },
        { name: "proficiency", type: "radio", label: "作業習熟度",
            radioOptions: {
                row: true,
                items: ["非常に良い", "良い", "普通", "やや劣る", "劣る"].map((v) => ({ id: v, name: v })),
            }
        },
        { name: "cooperativeness", type: "radio", label: "協調性",
            radioOptions: {
                row: true,
                items: ["非常に良い", "良い", "普通", "やや劣る", "劣る"].map((v) => ({ id: v, name: v })),
            }
        },

        { name: "remarks", type: "textarea", label: "特記事項", rows: 3 },

        { type: "slot", slotKey: "skills", gridSize: { xs: 12 }},

        // TODO 対象者だけ表示する
        { name: "primary_evaluator_id", type: "staffId", label: "一次評価者", gridSize: { xs: 12, sm: 6 },
            display: { labelPath: "primary_evaluator.name" }
        },
        { name: "secondary_evaluator_id", type: "staffId", label: "二次評価者", gridSize: { xs: 12, sm: 6 },
            display: { labelPath: "secondary_evaluator.name" },
        },
    ]
};
