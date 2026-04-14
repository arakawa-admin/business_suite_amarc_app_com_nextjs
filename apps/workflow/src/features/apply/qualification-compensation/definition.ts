import type { FormDefinition } from "../_core/types";
import type { QualificationCompensationInput } from "./zod";

export const qualificationCompensationDefinition: FormDefinition<QualificationCompensationInput> = {
    formCode: "qualification-compensation",
    title: "資格手当申請",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },

        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 },
            display: { gridSize: 12 }
        },

        { name: "reason", type: "textarea", label: "理由", rows: 3 },

        { type: "slot", slotKey: "skills", gridSize: { xs: 12 }},
    ]
};
