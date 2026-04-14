import type { FormDefinition } from "../_core/types";
import type { UseCloudDriveInput } from "./zod";

export const useCloudDriveDefinition: FormDefinition<UseCloudDriveInput> = {
    formCode: "use-cloud-drive",
    title: "googleアカウント個人端末使用申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },

        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 } },

        { name: "email", type: "text", label: "使用アカウント", gridSize: { xs: 12, sm: 6 },
            inputOptions: { endAdornment: "@amarc.co.jp" }
        },

        { name: "terminal", type: "text", label: "使用端末", gridSize: { xs: 12, sm: 6 }, },
        { name: "os", type: "text", label: "端末OS", gridSize: { xs: 12, sm: 6 }, },

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
            display: { gridSize: 6 }
        },

        { name: "reason", type: "textarea", label: "理由", rows: 2 },
    ]
};
