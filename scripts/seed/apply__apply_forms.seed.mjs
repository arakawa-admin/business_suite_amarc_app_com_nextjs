import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedApplyForms() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const apply = supabase.schema("apply");

    // 既存データ削除（全部）
    {
        const { error } = await apply
            .from("apply_forms")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }
    {
        const { error } = await apply
            .from("apply_form_categories")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }

    const categories = [
        {
            name: "雇用関連",
            code: "employment",
            description: "",
            sort_order: 100,
            applys: [
                {
                    name: "パート社員雇用継続申請",
                    code: "part-time-employment",
                    description: "",
                    sort_order: 100,
                    icon: "PersonAddAlt",
                },
                {
                    name: "契約社員雇用継続申請",
                    code: "contract-employment",
                    description: "",
                    sort_order: 110,
                    icon: "PersonAdd",
                },
                {
                    name: "再雇用希望申請",
                    code: "re-employment",
                    description: "",
                    sort_order: 120,
                    icon: "Person",
                },
                {
                    name: "試用期間満了申請",
                    code: "end-trial-employment",
                    description: "",
                    sort_order: 130,
                    icon: "GroupAdd",
                },
            ],
        },
        {
            name: "従業員関連",
            code: "staff",
            description: "",
            sort_order: 200,
            applys: [
                {
                    name: "変更届",
                    code: "change-profile",
                    description: "",
                    sort_order: 210,
                    icon: "Update",
                },
                {
                    name: "資格手当申請",
                    code: "qualification-compensation",
                    description: "",
                    sort_order: 220,
                    icon: "FolderShared",
                },
            ],
        },
        {
            name: "車関連",
            code: "car",
            description: "",
            sort_order: 300,
            applys: [
                {
                    name: "個人所有車使用許可申請",
                    code: "use-privately-owner-vehicle",
                    description: "",
                    sort_order: 310,
                    icon: "DirectionsCar",
                },
                {
                    name: "社有車使用許可申請",
                    code: "use-company-owner-vehicle",
                    description: "",
                    sort_order: 320,
                    icon: "LocalShipping",
                },
            ],
        },
        {
            name: "アカウント関連",
            code: "account",
            description: "",
            sort_order: 400,
            applys: [
                {
                    name: "googleアカウント個人端末使用申請",
                    code: "use-google-account",
                    description: "",
                    sort_order: 410,
                    icon: "Google",
                },
                {
                    name: "ファイル共有ドライブ使用申請",
                    code: "use-cloud-drive",
                    description: "",
                    sort_order: 420,
                    icon: "Backup",
                },
            ],
        },
        {
            name: "報告書関連",
            code: "report",
            description: "",
            sort_order: 500,
            applys: [
                {
                    name: "講演会/セミナー報告書",
                    code: "seminar-report",
                    description: "",
                    sort_order: 510,
                    icon: "",
                },
            ],
        },
    ];


    for (const c of categories) {
        const catId = uuidv4();

        const loginPayload = {
            id: catId,
            name: c.name,
            code: c.code,
            sort_order: c.sort_order,
            description: c.descriptionx
        };

        const { error: userErr } = await apply
            .from("apply_form_categories")
            .insert([loginPayload])
            .select()
            .single();
        if (userErr) {
            console.error("Insert apply_form_categories error:", userErr);
            throw userErr;
        }

        for (const a of c.applys) {
            const applyPayload = {
                id: uuidv4(),
                category_id: catId,
                name: a.name,
                code: a.code,
                sort_order: a.sort_order,
                description: a.description,
                icon: a.icon,
                valid_at: "2026-01-01T00:00:00Z",
                invalid_at: "2050-12-31T00:00:00Z",
            };

            const { error: userErr } = await apply
                .from("apply_forms")
                .insert([applyPayload])
                .select()
                .single();
            if (userErr) {
                console.error("Insert apply_forms error:", userErr);
                throw userErr;
            }
        }

    }

    console.log("apply_forms seeded successfully!");
}
