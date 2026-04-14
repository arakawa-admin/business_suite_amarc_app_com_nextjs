import type { UsePrivatelyOwnerVehicleInput } from "./zod";
import { startOfDay, endOfDay } from "date-fns";

export const usePrivatelyOwnerVehicleDefaults: UsePrivatelyOwnerVehicleInput = {
    author_id: "",
    department_id: "",

    is_usually: true,

    start_date: startOfDay(new Date()),
    end_date: endOfDay(new Date()),

    reason: "",
    car_name: "",
    car_no: "",

    owner: "",
    target_user_id: "",

    is_liability_insurance: false,
    insurance_start_date: startOfDay(new Date()),
    insurance_end_date: endOfDay(new Date()),

    personal_insurance: "",
    property_insurance: "",
    passenger_insurance: "",

    is_maintenance: false,
    maintenance_detail: "",

    is_violation: false,

    license_file: [],
    inspection_file: [],
    insurance_file: [],
};
