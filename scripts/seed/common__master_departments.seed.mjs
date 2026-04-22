import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterDepartments() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const common = supabase.schema("common");

    // 既存データ削除（全部）
    {
        const { error } = await common
            .from("master_departments")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }


    // master_companysから全部署IDを取得
    const { data: masterCompanys, error: depError } = await common
        .from("master_companys")
        .select("id, name, code");
    if (depError) {
        console.error("Error fetching master_companys:", depError.message);
        throw depError;
    }
    if (!masterCompanys.length) {
        console.error("No companys found in master_companys.");
        return;
    }

    const departments = [
        {
            code: "kitakata",
            name: "アマルク喜多方",
            kana: "アマルクキタカタ",
            sort_order: 110,
            color_code: "#81c784",
            mailing_list: "dummy-system-notify-kitakata@amarc.co.jp",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "machikita",
            name: "アマルク会津町北",
            kana: "アマルクアイヅマチキタ",
            sort_order: 120,
            color_code: "#81d4fa",
            mailing_list: "dummy-system-notify-machikita@amarc.co.jp",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "ichinoseki",
            name: "アマルク会津一ノ堰",
            kana: "アマルクアイヅイチノセキ",
            sort_order: 130,
            color_code: "#ffe082",
            mailing_list: "dummy-system-notify-ichinoseki@amarc.co.jp",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "koriyama",
            name: "アマルク郡山",
            kana: "アマルクコオリヤマ",
            sort_order: 140,
            color_code: "#ce93d8",
            mailing_list: "dummy-system-notify-koriyama@amarc.co.jp",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "koji",
            name: "工事部",
            kana: "コウジブ",
            sort_order: 210,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "bandai",
            name: "磐梯事業部",
            kana: "バンダイジギョウブ",
            sort_order: 220,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "seibi",
            name: "整備部",
            kana: "セイビブ",
            sort_order: 230,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },

        {
            code: "bpo",
            name: "BPO事業部",
            kana: "BPOジギョウブ",
            sort_order: 410,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        
        {
            code: "soumu",
            name: "総務部",
            kana: "ソウムブ",
            sort_order: 610,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "koriyama_branch",
            name: "郡山支店",
            kana: "コオリヤマシテン",
            sort_order: 620,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        
        {
            code: "kwc",
            name: "郡山ウエイストセンター",
            kana: "コオリヤマウエイストセンター",
            sort_order: 810,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "plastic",
            name: "プラ３Rセンター",
            kana: "プラスリーアールセンター",
            sort_order: 820,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "compost",
            name: "コンポスト",
            kana: "コンポスト",
            sort_order: 830,
            color_code: "#ce93d8",
            mailing_list: "",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
        {
            code: "admin",
            name: "管理者",
            kana: "カンリシャ",
            sort_order: 990,
            color_code: "#cfd8dc",
            mailing_list: "arakawa@amarc.co.jp",
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_code: "arakawa",
        },
	];

    for (const department of departments) {
        const payload = {
            id: uuidv4(),
            code: department.code,
            name: department.name,
            kana: department.kana,
            sort_order: department.sort_order,
            color_code: department.color_code,
            mailing_list: department.mailing_list,
            valid_at: "2026-01-01T00:00:00Z",
            invalid_at: "2050-12-31T00:00:00Z",
            company_id: masterCompanys.find((c) => c.code === department.company_code).id
        };

        const { error: userErr } = await common
            .from("master_departments")
            .insert([payload]);
        if (userErr) {
            console.error("Insert master_departments error:", userErr);
            throw userErr;
        }
    }

    console.log("master_departments seeded successfully!");
}
