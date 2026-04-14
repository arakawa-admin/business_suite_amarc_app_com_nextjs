import type { UseGoogleAccountInput } from "./zod";
import { startOfDay } from "date-fns";

export const useGoogleAccountDefaults: UseGoogleAccountInput = {
    author_id: "",
    department_id: "",

    email: "",
    terminal: "",
    os: "",

    start_date: startOfDay(new Date()),

    reason: "",
};
