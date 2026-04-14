import type { UseCompanyOwnerVehicleInput } from "./zod";
import { startOfDay, endOfDay } from "date-fns";

export const useCompanyOwnerVehicleDefaults: UseCompanyOwnerVehicleInput = {
    author_id: "",
    department_id: "",

    post_files: [],

    start_date: startOfDay(new Date()),
    end_date: endOfDay(new Date()),

    destination: "",
    reason: "",
    car_name: "",
    car_no: "",

    is_maintenance: false,
    maintenance_detail: "",

    is_violation: false,
    operation_years: undefined,
};
