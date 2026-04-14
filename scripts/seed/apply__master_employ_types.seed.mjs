import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterEmployTypes() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const apply = supabase.schema("apply");

    // 既存データ削除（全部）
    {
        const { error } = await apply
            .from("master_employ_types")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }

    const status = [
        {
            name: "正社員",
            code: "fulltime",
            sort_order: 10,
        },
        {
            name: "嘱託社員",
            code: "commission",
            sort_order: 20,
        },
        {
            name: "契約社員",
            code: "contract",
            sort_order: 30,
        },
        {
            name: "試用者",
            code: "trial",
            sort_order: 40,
        },
        {
            name: "パートタイム社員",
            code: "parttime",
            sort_order: 50,
        },
        {
            name: "派遣社員",
            code: "dispatch",
            sort_order: 60,
        },
        {
            name: "役員",
            code: "officer",
            sort_order: 70,
        },
        {
            name: "退職予定",
            code: "planned_retirement",
            sort_order: 80,
        },
        {
            name: "退職者",
            code: "retirement",
            sort_order: 90,
        },
        {
            name: "その他",
            code: "other",
            sort_order: 100,
        },
	];


    for (const s of status) {
        const payload = {
            id: uuidv4(),
            name: s.name,
            code: s.code,
            sort_order: s.sort_order,
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        };

        const { error: userErr } = await apply
            .from("master_employ_types")
            .insert([payload]);
        if (userErr) {
            console.error("Insert master_employ_types error:", userErr);
            throw userErr;
        }
    }

    console.log("master_employ_types seeded successfully!");
}
