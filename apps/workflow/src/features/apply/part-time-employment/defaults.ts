import type { PartTimeEmploymentInput } from "./zod";
import { set, startOfDay, endOfDay } from "date-fns";

export const partTimeEmploymentDefaults: PartTimeEmploymentInput = {
    author_id: "",
    department_id: "",
    target_user_id: "",

    employ_start_date: startOfDay(new Date()),
    employ_deadline_date: endOfDay(new Date()),

    employ_type: "full",
    workdays: [],
    start_worktime: set(new Date(), { hours: 8, minutes: 0, seconds: 0, milliseconds: 0 }),
    end_worktime: set(new Date(), { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 }),
    breaktimes: [],

    other_reason: "",

    work_place: "",
    work_content: "",
    health: "",

    skills: [],
};
