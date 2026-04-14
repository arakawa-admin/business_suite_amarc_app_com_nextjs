import type { FormDefinition } from "../_core/types";
import type { SeminarReportInput } from "./zod";

export const seminarReportDefinition: FormDefinition<SeminarReportInput> = {
    formCode: "seminar-report",
    title: "セミナー報告書",
    fields: [
        { name: "department_id", type: "departmentId", label: "部門", gridSize: { xs: 12, sm: 6 },
            selectDeptOptions: { includeAll: false, },
            display: { visible: false }
        },

        { name: "author_id", type: "staffId", label: "申請者", disabled: true, gridSize: { xs: 12, sm: 6 },
            display: { gridSize: 12 }
        },

        { name: "date", type: "date", label: "とき", display: { gridSize: 6 } },
        { name: "place", type: "text", label: "ところ", display: { gridSize: 6 } },
        { name: "theme", type: "text", label: "テーマ", display: { gridSize: 6 } },
        { name: "teacher", type: "text", label: "講師", display: { gridSize: 6 } },


        {
            type: "group",
            label: "勉強になったこと",
            fields: [
                { name: "notice_1", type: "textarea", label: "1" },
                { name: "notice_2", type: "textarea", label: "2" },
                { name: "notice_3", type: "textarea", label: "3" },
                { name: "notice_4", type: "textarea", label: "4" },
                { name: "notice_5", type: "textarea", label: "5" },
            ],
        },
        {
            type: "group",
            label: "自分で取り組むこと、会社として取り組んだ方が良いと思うこと",
            fields: [
                { name: "todo_1", type: "textarea", label: "1" },
                { name: "todo_2", type: "textarea", label: "2" },
                { name: "todo_3", type: "textarea", label: "3" },
                { name: "todo_4", type: "textarea", label: "4" },
                { name: "todo_5", type: "textarea", label: "5" },
            ],
        },

        { name: "remarks", type: "textarea", label: "その他何でも結構です。気づいたことがあれば入力してください" },
        { name: "point", label: "今回のセミナーは何点でしたか？", type: "slot", slotKey: "point", gridSize: { xs: 12 } },

        { name: "post_files", type: "file" },
    ]
};
