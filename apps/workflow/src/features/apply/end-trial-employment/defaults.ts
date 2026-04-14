import type { EndTrialEmploymentInput } from "./zod";
import { set, startOfDay, endOfDay } from "date-fns";

export const endTrialEmploymentDefaults: EndTrialEmploymentInput = {
    author_id: "",
    department_id: "",
    target_user_id: "",

    employ_start_date: startOfDay(new Date()),
    employ_deadline_date: endOfDay(new Date()),

    trial_deadline: startOfDay(new Date()),

    interview_start_time: set(new Date(), { hours: 8, minutes: 0, seconds: 0, milliseconds: 0 }),
    interview_end_time: set(new Date(), { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 }),

    is_perfect_attendance: true,
	absentee_days: undefined,
    early_leave_times: undefined,
	late_times: undefined,

    is_disaster: true,
	nonstop_disaster: undefined,
	hiyari_disaster: undefined,

	attitude: "",
	proficiency: "",
	cooperativeness: "",

	remarks: "",

	primary_evaluator_id: "",
	secondary_evaluator_id: "",

    skills: [],
};
