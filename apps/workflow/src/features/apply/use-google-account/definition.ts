import type { FormDefinition } from "../_core/types";
import type { UseGoogleAccountInput } from "./zod";

export const useGoogleAccountDefinition: FormDefinition<UseGoogleAccountInput> = {
    formCode: "use-google-account",
    title: "googleアカウント個人端末使用申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },

        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 },
            display: { gridSize: 12 }
        },

        { name: "email", type: "text", label: "使用アカウント", gridSize: { xs: 12, sm: 6 },
            inputOptions: { endAdornment: "@amarc.co.jp" },
        },
        { name: "terminal", type: "text", label: "端末", gridSize: { xs: 12, sm: 6 }, },
        { name: "os", type: "text", label: "OS", gridSize: { xs: 12, sm: 6 }, },
        { name: "start_date", type: "date", label: "使用開始日", gridSize: { xs: 12, sm: 6 }, },

        { name: "reason", type: "textarea", label: "用途・目的", rows: 2 },
    ]
};
