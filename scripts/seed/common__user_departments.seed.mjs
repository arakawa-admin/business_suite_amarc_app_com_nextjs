import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedUserDepartments() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const common = supabase.schema("common");
    // 既存データ削除（全部）
    {
        const { error } = await common
            .from("staff_departments")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }

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

    // ***** editor *****
    const users = [
        // ***** 管理者 *****
        {
            name: "若林 雅也",
            dept_code: "admin",
        },
        {
            name: "ダミー",
            dept_code: "kitakata",
        },
        {
            name: "回議者A",
            dept_code: "kitakata",
        },
    ];

    try {
        for (const user of users) {
            const payload = {
                id: uuidv4(),
                staff_id: masterStaffs.find((c) => c.name === user.name).id,
                department_id: masterDepartments.find((c) => c.code === user.dept_code).id,
                // valid_at: "2026-01-01T00:00:00Z",
                // invalid_at: "2050-12-31T00:00:00Z",
            };

            const { error: userErr } = await common
                .from("staff_departments")
                .insert(payload);

            if (userErr) {
                console.error("Insert staff_departments error:", userErr);
                throw userErr;
            }
        };
    } catch (error) {
        console.error("Seed error:", error.message);
        throw error;
    }

    console.log("user_departments seeded successfully!");
}
