import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedClearAssets() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const assets = supabase.schema("assets");

    // 既存データ削除（全部）
    {
        const { error } = await assets
            .from("vehicles")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete vehicles error:", error);
            throw error;
        }
    }
    {
        const { error } = await assets
            .from("master_insurance_categories")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete master_insurance_categories error:", error);
            throw error;
        }
    }
    {
        const { error } = await assets
            .from("master_insurance_agencies")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete master_insurance_agencies error:", error);
            throw error;
        }
    }
    {
        const { error } = await assets
            .from("audit_logs")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete audit_logs error:", error);
            throw error;
        }
    }
    {
        const { error } = await assets
            .from("attachments")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete attachments error:", error);
            throw error;
        }
    }
    {
        const { error } = await assets
            .from("attachment_links")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete attachment_links error:", error);
            throw error;
        }
    }
    {
        const { error } = await assets
            .from("comments")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete comments error:", error);
            throw error;
        }
    }
    {
        const { error } = await assets
            .from("reminders")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Delete reminders error:", error);
            throw error;
        }
    }

    console.log("assetes seeded successfully!");
}
