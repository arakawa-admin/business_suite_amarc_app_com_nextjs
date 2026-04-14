import type { ContractEmploymentInput } from "./zod";
import { startOfDay, endOfDay } from "date-fns";

export const contractEmploymentDefaults: ContractEmploymentInput = {
    author_id: "",
    department_id: "",
    target_user_id: "",

    employ_start_date: startOfDay(new Date()),
    employ_deadline_date: endOfDay(new Date()),

    work_place: "",
    work_content: "",
    health: "",

    skills: [],
};
