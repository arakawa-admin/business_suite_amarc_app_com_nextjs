import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterStaffOptions() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const apply = supabase.schema("apply");

    // 既存データ削除（全部）
    {
        const { error } = await apply
            .from("master_staff_options")
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
    // master_employ_typesから全雇用形態IDを取得
    const { data: employTypes, error: employError } = await apply
        .from("master_employ_types")
        .select("id, code");
    if (employError) {
        console.error("Error fetching master_employ_types:", employError.message);
        throw employError;
    }
    if (!employTypes.length) {
        console.error("No employ types found in master_employ_types.");
        return;
    }

    const staffOptions = [
        {
            name: "ダミー",
            birthday: "2010-10-01T00:00:00Z",
            employ_type: "parttime",
            employ_start: "2020-01-01T00:00:00Z",
            employ_deadline: "2035-12-31T23:59:59Z",
            next_notification: null,
        },
        {
            name: "回議者A",
            birthday: "2010-10-01T00:00:00Z",
            employ_type: "contract",
            employ_start: "2020-01-01T00:00:00Z",
            employ_deadline: "2035-12-31T23:59:59Z",
            next_notification: null,
        },
	];
    for (const i of staffOptions) {
        const payload = {
            id: uuidv4(),
            staff_id: masterStaffs.find((c) => c.name === i.name).id,
            birthday: i.birthday,
            employ_type_id: employTypes.find((c) => c.code === i.employ_type).id,
            employ_start: i.employ_start,
            employ_deadline: i.employ_deadline,
            next_notification: i.next_notification,
        };

        const { error: userErr } = await apply
            .from("master_staff_options")
            .insert([payload]);
        if (userErr) {
            console.error("Insert master_staff_options error:", userErr);
            throw userErr;
        }
    }

    console.log("master_staff_options seeded successfully!");
}
