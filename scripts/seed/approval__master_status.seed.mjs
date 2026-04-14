import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterStatus() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const approval = supabase.schema("approval");

    // 既存データ削除（全部）
    {
        const { error } = await approval
            .from("master_status")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }

    const status = [
        {
            id: uuidv4(),
            name: "待機中",
            code: "waiting",
            sort_order: 10,
            color: "inherit",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        },
        {
            id: uuidv4(),
            name: "決裁中",
            code: "pending",
            sort_order: 100,
            color: "info",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        },
        {
            id: uuidv4(),
            name: "差し戻し",
            code: "return",
            sort_order: 200,
            color: "warning",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        },
        {
            id: uuidv4(),
            name: "承認",
            code: "approved",
            sort_order: 990,
            color: "success",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        },
        {
            id: uuidv4(),
            name: "否認",
            code: "rejected",
            sort_order: 800,
            color: "error",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        },
        {
            id: uuidv4(),
            name: "取消",
            code: "cancelled",
            sort_order: 900,
            color: "inherit",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        },
	];


    for (const s of status) {
        const loginPayload = {
            id: uuidv4(),
            name: s.name,
            code: s.code,
            color: s.color,
            sort_order: s.sort_order,
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
        };

        const { error: userErr } = await approval
            .from("master_status")
            .insert([loginPayload]);
        if (userErr) {
            console.error("Insert master_status error:", userErr);
            throw userErr;
        }
    }

    console.log("master_status seeded successfully!");
}
