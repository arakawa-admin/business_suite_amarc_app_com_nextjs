import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterCompanys() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const common = supabase.schema("common");

    // 既存データ削除（全部）
    {
        const { error } = await common
            .from("master_companys")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }

    const companys = [
        {
            code: "arakawa",
            name: "荒川産業 株式会社",
            kana: "アラカワサンギョウカブシキガイシャ",
            sort_order: 110,
            valid_at: "2025-10-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        },
	];

    for (const company of companys) {
        const payload = {
            id: uuidv4(),
            code: company.code,
            name: company.name,
            kana: company.kana,
            sort_order: company.sort_order,
            remarks: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        };

        const { error: userErr } = await common
            .from("master_companys")
            .insert([payload]);
        if (userErr) {
            console.error("Insert master_companys error:", userErr);
            throw userErr;
        }
    }

    console.log("master_companys seeded successfully!");
}
