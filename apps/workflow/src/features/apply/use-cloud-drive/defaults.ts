import type { UseCloudDriveInput } from "./zod";
import { startOfDay, endOfDay } from "date-fns";

export const useCloudDriveDefaults: UseCloudDriveInput = {
    author_id: "",
    department_id: "",

    email: "",
    terminal: "",
    os: "",

    start_date: startOfDay(new Date()),
    end_date: endOfDay(new Date()),

    reason: "",
};
