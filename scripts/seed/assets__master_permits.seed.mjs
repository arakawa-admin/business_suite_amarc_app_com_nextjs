import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterPermitCategories() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const assets = supabase.schema("assets");

    // 既存データ削除（全部）
    {
        const { error } = await assets
            .from("master_permit_categories")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }

    const categories = [
        {
            code: "industrial_waste",
            name: "産業廃棄物の許可",
            sort_order: 100,
        },
        {
            code: "outdoor_storage",
            name: "屋外保管の適正化に関する条例",
            sort_order: 200,
        },
        {
            code: "industrial_waste_training",
            name: "産業廃棄物の講習",
            sort_order: 300,
        },
        {
            code: "general_waste",
            name: "一般廃棄物の許可",
            sort_order: 400,
        },
        {
            code: "non_industrial_waste",
            name: "廃棄物以外の許可",
            sort_order: 500,
        },
        {
            code: "bid_qualification",
            name: "入札参加資格",
            sort_order: 600,
        },
        {
            code: "other",
            name: "その他",
            sort_order: 700,
        },
        {
            code: "entrusted_disposal_service",
            name: "委託処分先(契約書リスト番号)産業廃棄物の許可",
            sort_order: 800,
        },
	];


    for (const c of categories) {
        const payload = {
            id: uuidv4(),
            code: c.code,
            name: c.name,
            sort_order: c.sort_order,
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        };

        const { error: userErr } = await assets
            .from("master_permit_categories")
            .insert([payload]);
        if (userErr) {
            console.error("Insert master_permit_categories error:", userErr);
            throw userErr;
        }
    }

    console.log("master_permit_categories seeded successfully!");
}
