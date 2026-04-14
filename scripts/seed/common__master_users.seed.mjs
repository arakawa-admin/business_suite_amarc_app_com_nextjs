import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export async function seedMasterUsers() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const common = supabase.schema("common");
    // 既存データ削除（全部）
    {
        const { error } = await common
            .from("master_login_users")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
        const { error: e2 } = await common
            .from("master_staffs")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (e2) {
            console.error("Delete staffs error:", e2);
            throw e2;
        }
        const { error: e3 } = await common
            .from("staff_departments")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (e2) {
            console.error("Delete staffs error:", e3);
            throw e3;
        }
    }

    // ***** editor *****
    const users = [
        // ***** 管理者 *****
        {
            name: "若林 雅也",
            email: "wakabayashi",
            is_admin: true,
            staffs: [
                {
                    name: "若林 雅也",
                    kana: "ワカバヤシ マサヤ",
                },
                {
                    name: "ダミー",
                    kana: "ダミー",
                },
            ],
        },
        {
            name: "インフォ",
            email: "info",
            staffs: [
                {
                    name: "承認者A",
                    kana: "ショウニンシャA",
                },
                {
                    name: "承認者B",
                    kana: "ショウニンシャB",
                },
                {
                    name: "承認者C",
                    kana: "ショウニンシャC",
                },
                {
                    name: "承認者D",
                    kana: "ショウニンシャD",
                },
            ],
        },
        {
            name: "アマルク喜多方",
            email: "kitakata",
            staffs: [
                {
                    name: "回議者A",
                    kana: "カイギシャA",
                },
                {
                    name: "回議者B",
                    kana: "カイギシャB",
                },
                {
                    name: "回議者C",
                    kana: "カイギシャC",
                },
                {
                    name: "閲覧者A",
                    kana: "エツランシャA",
                },
                {
                    name: "閲覧者B",
                    kana: "エツランシャB",
                },
                {
                    name: "閲覧者C",
                    kana: "エツランシャC",
                },
            ],
        },
        // ***** アマルク喜多方 *****
        // {
        //     name: "高橋 正人",
        //     email: "masato",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "高橋 正人",
        //                     kana: "タカハシ マサト",
        //                 },
        //             ],
        //         },
        //         {
        //             name: "アマルク会津町北",
        //             staffs: [
        //                 {
        //                     name: "高橋 正人",
        //                     kana: "タカハシ マサト",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "鱒淵 優子",
        //     email: "y-masu",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "鱒淵 優子",
        //                     kana: "マスブチ ユウコ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "庄司 望",
        //     email: "shoji",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "庄司 望",
        //                     kana: "ショウジ ノゾミ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "大塚 隼人",
        //     email: "otsuka",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "大塚 隼人",
        //                     kana: "オオツカ ハヤト",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "齋藤 鉄",
        //     email: "t.saito",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "齋藤 鉄",
        //                     kana: "サイトウ テツ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "新田 龍生",
        //     email: "r.nitta",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "新田 龍生",
        //                     kana: "ニッタ リュウセイ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "中村 重昭",
        //     email: "nakamura",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "中村 重昭",
        //                     kana: "ナカムラ シゲアキ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "齊藤 紀織",
        //     email: "k.saito",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "齊藤 紀織",
        //                     kana: "サイトウ キヨリ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "アマルク喜多方 共有",
        //     email: "kitakata",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク喜多方",
        //             staffs: [
        //                 {
        //                     name: "安藤 啓延",
        //                     kana: "アンドウ ヒロノブ",
        //                 },
        //                 {
        //                     name: "古川 英一",
        //                     kana: "フルカワ ヒデカズ",
        //                 },
        //                 {
        //                     name: "川窪 勝",
        //                     kana: "カワクボ マサル",
        //                 },
        //                 {
        //                     name: "渡部 勉",
        //                     kana: "ワタナベ ツトム",
        //                 },
        //                 {
        //                     name: "伊藤 広司",
        //                     kana: "イトウ コウジ",
        //                 },
        //                 {
        //                     name: "小椋 英希",
        //                     kana: "オグラ ヒデキ",
        //                 },
        //                 {
        //                     name: "大川原 健太",
        //                     kana: "オオカワラ ケンタ",
        //                 },
        //                 {
        //                     name: "齋藤 元雄",
        //                     kana: "サイトウ モトオ",
        //                 },
        //                 {
        //                     name: "内川 忠",
        //                     kana: "ウチカワ タダシ",
        //                 },
        //                 {
        //                     name: "佐藤 庄介",
        //                     kana: "サトウ ショウスケ",
        //                 },
        //                 {
        //                     name: "山口 一樹",
        //                     kana: "ヤマグチ カズキ",
        //                 },
        //                 {
        //                     name: "石井 奈緒",
        //                     kana: "イシイ ナオ",
        //                 },
        //                 {
        //                     name: "渡辺 文喜",
        //                     kana: "ワタナベ フミキ",
        //                 },
        //                 {
        //                     name: "束原 理菜",
        //                     kana: "ツカハラ リナ",
        //                 },                    ],
        //         },
        //     ],
        // },

        // ***** アマルク会津町北 *****
        // {
        //     name: "要 彩華",
        //     email: "kaname",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津町北",
        //             staffs: [
        //                 {
        //                     name: "要 彩華",
        //                     kana: "カナメ サヤカ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "舟城 裕太",
        //     email: "funaki",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津町北",
        //             staffs: [
        //                 {
        //                     name: "舟城 裕太",
        //                     kana: "フナキ ユウタ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "アマルク会津町北",
        //     email: "asc",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津町北",
        //             staffs: [
        //                 {
        //                     name: "坂内 理久",
        //                     kana: "バンナイ リク",
        //                 },
        //                 {
        //                     name: "大塚 正武",
        //                     kana: "オオツカ マサタケ",
        //                 },
        //                 {
        //                     name: "大関 敦士",
        //                     kana: "オオゼキ アツシ",
        //                 },
        //             ],
        //         },
        //     ],
        // },

        // ***** アマルク会津一ノ堰 *****
        // {
        //     name: "小澤 拓也",
        //     email: "ozawa",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津一ノ堰",
        //             staffs: [
        //                 {
        //                     name: "小澤 拓也",
        //                     kana: "オザワ タクヤ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "上野 理子",
        //     email: "ueno",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津一ノ堰",
        //             staffs: [
        //                 {
        //                     name: "上野 理子",
        //                     kana: "ウエノ リコ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "川口 圭太",
        //     email: "keita",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津一ノ堰",
        //             staffs: [
        //                 {
        //                     name: "川口 圭太",
        //                     kana: "カワグチ ケイタ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "鈴木 一弘",
        //     email: "k.suzuki",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津一ノ堰",
        //             staffs: [
        //                 {
        //                     name: "鈴木 一弘",
        //                     kana: "スズキ カズヒロ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "アマルク会津一ノ堰",
        //     email: "monden",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク会津一ノ堰",
        //             staffs: [
        //                 {
        //                     name: "荒川 信夫",
        //                     kana: "アラカワ ノブオ",
        //                 },
        //                 {
        //                     name: "星 優大",
        //                     kana: "ホシ ユウダイ",
        //                 },
        //                 {
        //                     name: "五十嵐 市雄",
        //                     kana: "イガラシ イチオ",
        //                 },
        //                 {
        //                     name: "鈴木 正広",
        //                     kana: "スズキ マサヒロ",
        //                 },
        //                 {
        //                     name: "永井 一希",
        //                     kana: "ナガイ カズキ",
        //                 },
        //                 {
        //                     name: "原 あゆみ",
        //                     kana: "ハラ アユミ",
        //                 },
        //                 {
        //                     name: "齋藤 一樹",
        //                     kana: "サイトウ カズキ",
        //                 },
        //             ],
        //         },
        //     ],
        // },

        // ***** アマルク郡山 *****
        // {
        //     name: "田中 賢",
        //     email: "tanaka",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク郡山",
        //             staffs: [
        //                 {
        //                     name: "田中 賢",
        //                     kana: "タナカ ケン",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "小林 潤一朗",
        //     email: "j-kobayashi",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク郡山",
        //             staffs: [
        //                 {
        //                     name: "小林 潤一朗",
        //                     kana: "コバヤシ ジュンイチロウ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "安齋 婦美子",
        //     email: "anzai",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク郡山",
        //             staffs: [
        //                 {
        //                     name: "安齋 婦美子",
        //                     kana: "アンザイ フミコ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     name: "アマルク 郡山",
        //     email: "koriyama",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "アマルク郡山",
        //             staffs: [
        //                 {
        //                     name: "木幡 和寿",
        //                     kana: "コハタ カズトシ",
        //                 },
        //                 {
        //                     name: "高田 哲夫",
        //                     kana: "タカダ テツオ",
        //                 },
        //                 {
        //                     name: "迎田 美治",
        //                     kana: "ムカエダ ヨシハル",
        //                 },
        //                 {
        //                     name: "渡辺 誠",
        //                     kana: "ワタナベ マコト",
        //                 },
        //                 {
        //                     name: "滝田 慧",
        //                     kana: "タキタ サトル",
        //                 },
        //                 {
        //                     name: "久保木 昭",
        //                     kana: "クボキ アキラ",
        //                 },
        //                 {
        //                     name: "菅野 千穂美",
        //                     kana: "カンノ チホミ",
        //                 },
        //             ],
        //         },
        //     ],
        // },

        // ***** 営業部 *****
        // {
        //     name: "矢吹 竜也",
        //     email: "yabuki",
        //     is_admin: false,
        //     departments: [
        //         {
        //             name: "営業部",
        //             staffs: [
        //                 {
        //                     name: "矢吹 竜也",
        //                     kana: "ヤブキ タツヤ",
        //                 },
        //             ],
        //         },
        //     ],
        // },
    ];

    try {
        for (const user of users) {
            const login_user_id = uuidv4();

            const loginPayload = {
                id: login_user_id,
                name: user.name,
                email: `${user.email}@amarc.co.jp`,
                is_admin: user.is_admin ?? false,
                valid_at: "2026-01-01T00:00:00Z",
                invalid_at: "2050-12-31T00:00:00Z",
            };

            const { error: userErr } = await common
                .from("master_login_users")
                .insert(loginPayload);

            if (userErr) {
                console.error("Insert login_user error:", userErr);
                throw userErr;
            }

            for (const staff of user.staffs) {
                const staff_id = uuidv4();
                const payload = {
                    id: staff_id,
                    login_user_id: login_user_id,
                    name: staff.name,
                    kana: staff.kana,
                    remarks: "",
                    valid_at: "2026-01-01T00:00:00Z",
                    invalid_at: "2050-12-31T00:00:00Z",
                };
                const { error: staffError } = await common
                    .from("master_staffs")
                    .insert(payload);
                if (staffError) {
                    console.error("Seed error:", staffError.message);
                    throw staffError;
                }
            };
        };
    } catch (error) {
        console.error("Seed error:", error.message);
        throw error;
    }

    console.log("master_login_users seeded successfully!");
}
