import type { ChangeProfileInput } from "./zod";
import { startOfDay } from "date-fns";

export const changeProfileDefaults: ChangeProfileInput = {
    author_id: "",
    department_id: "",

    change_date: startOfDay(new Date()),
    reason: "",

    is_name_change: false,
    name_before: "",
    name_after: "",
    kana_before: "",
    kana_after: "",

    is_address_change: false,
    address_before: "",
    address_after: "",
    zipcode_before: undefined,
    zipcode_after: undefined,

    is_distance_change: false,
    distance_before: undefined,
    distance_after: undefined,

    is_tel_change: false,
    tel_before: undefined,
    tel_after: undefined,

    is_mobile_change: false,
    mobile_before: undefined,
    mobile_after: undefined,

    is_emergency_contacts_change: false,
    emergency_contacts: [],

    is_bank_account: false,
    bank_before: undefined,
    branch_before: "",
    account_no_before: "",
    account_name_before: "",
    bank_after: undefined,
    branch_after: "",
    account_no_after: "",
    account_name_after: "",

    is_dependent_change: false,
    dependents: [],
};
