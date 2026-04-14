import type { ReEmploymentInput } from "./zod";
import { startOfDay } from "date-fns";

export const reEmploymentDefaults: ReEmploymentInput = {
    author_id: "",
    department_id: "",

    target_user_id: "",
    employ_deadline: startOfDay(new Date()),

    is_fulltime_days: false,
    working_days: undefined,

    is_fulltime_hours: false,
    working_hours: undefined,

    is_working_place: false,
    working_place: undefined,

    assessment: "",
    remarks: "",

    agreeTerms: false
};
