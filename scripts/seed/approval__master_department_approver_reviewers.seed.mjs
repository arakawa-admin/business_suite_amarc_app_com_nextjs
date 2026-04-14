import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterDepartmentApproverAndReviewers() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const approval = supabase.schema("approval");

    // 既存データ削除（全部）
    {
        const { error } = await approval
            .from("master_department_approvers")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }
    {
        const { error } = await approval
            .from("master_department_reviewers")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }


    const common = supabase.schema("common");
    // master_staffsから全部署IDを取得
    const { data: masterStaffs, error: staffError } = await common
        .from("master_staffs")
        .select("id, name");
    if (staffError) {
        console.error("Error fetching master_staffs:", staffError.message);
        throw staffError;
    }
    if (!masterStaffs.length) {
        console.error("No staffs found in master_staffs.");
        return;
    }
    // master_departmentsから全部署IDを取得
    const { data: masterDepartments, error: depError } = await common
        .from("master_departments")
        .select("id, code");
    if (depError) {
        console.error("Error fetching master_departments:", depError.message);
        throw depError;
    }
    if (!masterDepartments.length) {
        console.error("No departments found in master_departments.");
        return;
    }

    const approvers = [
        {
            name: "承認者A",
            dept_code: "kitakata",
            sequence: 1,
        },
        {
            name: "承認者B",
            dept_code: "kitakata",
            sequence: 2,
        },
        {
            name: "承認者C",
            dept_code: "kitakata",
            sequence: 3,
        },
	];
    for (const i of approvers) {
        const loginPayload = {
            id: uuidv4(),
            approver_user_id: masterStaffs.find((c) => c.name === i.name).id,
            department_id: masterDepartments.find((c) => c.code === i.dept_code).id,
            sequence: i.sequence,
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        };

        const { error: userErr } = await approval
            .from("master_department_approvers")
            .insert([loginPayload]);
        if (userErr) {
            console.error("Insert master_department_approvers error:", userErr);
            throw userErr;
        }
    }

    const reviewers = [
        {
            name: "回議者A",
            dept_code: "kitakata",
        },
        {
            name: "回議者B",
            dept_code: "kitakata",
        },
        {
            name: "回議者C",
            dept_code: "kitakata",
        },
	];
    for (const i of reviewers) {
        const loginPayload = {
            id: uuidv4(),
            reviewer_user_id: masterStaffs.find((c) => c.name === i.name).id,
            department_id: masterDepartments.find((c) => c.code === i.dept_code).id,
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        };

        const { error: userErr } = await approval
            .from("master_department_reviewers")
            .insert([loginPayload]);
        if (userErr) {
            console.error("Insert master_department_reviewers error:", userErr);
            throw userErr;
        }
    }

    console.log("master_department_reviewers seeded successfully!");



}
