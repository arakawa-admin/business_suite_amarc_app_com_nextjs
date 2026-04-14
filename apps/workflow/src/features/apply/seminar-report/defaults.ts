import type { SeminarReportInput } from "./zod";
import { startOfDay } from "date-fns";

export const seminarReportDefaults: SeminarReportInput = {
    author_id: "",
    department_id: "",

    post_files: [],

    date: startOfDay(new Date()),

    place: "",
    theme: "",
    teacher: "",

    notice_1: "",
    notice_2: "",
    notice_3: "",
    notice_4: "",
    notice_5: "",

    todo_1: "",
    todo_2: "",
    todo_3: "",
    todo_4: "",
    todo_5: "",

    remarks: "",
    point: 10,
};
