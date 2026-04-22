import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const RAW_ROWS = `
福島100す1179,kitakata,いすゞ,フォワード,クレーン付,コープ
福島11つ4914,kitakata,いすゞ,エルフ,平ボディ,コープ
福島100は1979,kitakata,いすゞ,フォワード,クレーン付,コープ
会津100さ1037,kitakata,三菱,ファイター,クレーン付,コープ
会津100は178,kitakata,いすゞ,ギガ,ダンプ,コープ
会津100さ1233,kitakata,いすゞ,フォワード,クレーン付,コープ
福島130さ1607,kitakata,いすゞ,フォワード,脱着装置付コンテナ専用車,コープ
会津100さ1907,kitakata,ニッサン,,コープ
会津100は586,kitakata,いすゞ,,平ボディ,コープ
会津480え9666,kitakata,スズキ,エブリィ,バン,コープ
会津400す1588,kitakata,プロボックス,バン,コープ
会津100は925,kitakata,日野,脱着装置付コンテナ専用車,コープ
会津800は397,kitakata,いすゞ,,塵芥車,コープ
福島800さ9437,kitakata,日デ,コンドル,塵芥車,三和倉庫
会津100さ3340,kitakata,エルフ250,3ｔパワーゲート,三和倉庫
会津100さ3713,kitakata,いすゞ,フォワード,脱着装置付コンテナ専用車,三和倉庫
会津130せ70,kitakata,日野,ダンプ,アスク
会津100ゆ9,machikita,,セミトレーラ,コープ
会津100は986,machikita,クオン,トラクタ,コープ
会津580え3060,machikita,ダイハツ,ミライース,箱型,コープ
会津100は6,ichinoseki,いすゞ,フォワード,脱着装置付コンテナ専用車,コープ
会津100は87,ichinoseki,日デ,クオン,クレーン付,コープ
会津580え7986,ichinoseki,ダイハツ,箱型,コープ
会津100は564,ichinoseki,三菱,ファイター,脱着装置付コンテナ専用車,コープ
会津400す1591,ichinoseki,プロボックス,バン,コープ
会津100さ4392,ichinoseki,いすゞ,キャブオーバー,コープ
福島100さ457,ichinoseki,日デ,コンドル,クレーン付,三和倉庫
会津100は643,ichinoseki,日野,アームロール車,アスク
会津100は624,ichinoseki,UDトラックス,ヒアブ,アスク
会津480え604,seibi,ニッサン,クリッパーバン,バン,三和倉庫
会津100さ911,seibi,日野,キャブオーバー,アスク
会津480あ4986,seibi,ニッサン,クリッパーバン,バン,アスク
会津100は278,koji,UD,,コープ
会津100さ1525,koji,いすゞ,,コープ
会津100さ2267,koji,UD,ユニック付,コープ
会津400す1073,koji,プロボックス,,コープ
会津400す785,koji,トヨタ,プロボックスGL,箱型,コープ
会津300ち9318,koji,セレナ,,コープ
会津400さ709,koji,トヨタ,トヨエース,平ボディ,アスク
会津480い9619,koji,スズキ,,アスク
会津400さ7880,koji,ダイナ,,アスク
会津100さ1608,kwc,トヨタ,,コープ
会津800さ2733,kwc,ニッサン,塵芥車,アスク
福島88す6832,kwc,いすゞ,エルフ,塵芥車,アスク
会津400さ4157,koriyama,トヨタ,ハイエース,バン,アスク
福島400せ5731,koriyama,トヨタ,サクシードバン,バン,アスク
会津100は739,koriyama,日野,クレーン付,アスク
会津100さ3585,koriyama,三菱キャンター,クレーン付,アスク
会津100は783,koriyama,日野,脱着装置付コンテナ専用車,アスク
会津100は850,koriyama,日野,トラクタ,アスク
会津100ゆ14,koriyama,フルハーフ,コンテナセミトレーラ,アスク
会津100は955,koriyama,いすゞ,増トンウイング車,アスク
会津500つ6553,plastic,ヴィッツ,箱型,コープ
会津100は689,bpo,三菱,ファイター,ウイング車,コープ
会津480う659,compost,スバル,平ボディ,コープ
会津美里町な323,compost,コマツ,フォークリフト,コープ
会津100さ2108,compost,日野,デュトロ,アルミ箱車,ゲート付,コープ
会津480か2066,compost,ミニキャブバン,バン,コープ
会津300た8678,koriyama_branch,トヨタ,CH-R,箱型,アスク
会津330ち5810,soumu,トヨタ,カムリ,箱型,コープ
会津400さ8958,soumu,トヨタ,プロボックス,,コープ
`;


const VEHICLE_METADATA = {
    "福島800さ9437": {
        model: "KK-MK25A",
        serialNumber: "MK25A06596",
        firstRegisteredYm: "2003-09",
    },
    "福島100す1179": {
        model: "ADG-FRR90K3S",
        serialNumber: null,
        firstRegisteredYm: "2006-01",
    },
    "福島11つ4914": {
        model: "KC-NRR33H3",
        serialNumber: null,
        firstRegisteredYm: "1999-03",
    },
    "福島100は1979": {
        model: "PJ-FTR34K4",
        serialNumber: "FTR34K47000129",
        firstRegisteredYm: "2006-04",
    },
    "会津100さ1037": {
        model: "KK-FK61HK",
        serialNumber: "FK61HK761310",
        firstRegisteredYm: "2003-03",
    },
    "会津100は178": {
        model: "LKG-CYZ77AM",
        serialNumber: "CYZ77AM7000265",
        firstRegisteredYm: "2012-03",
    },
    "会津100さ1233": {
        model: "KK-FRR35K4",
        serialNumber: "FRR35K47001597",
        firstRegisteredYm: "2004-01",
    },
    "福島130さ1607": {
        model: "PB-FRR35H3S",
        serialNumber: null,
        firstRegisteredYm: "2004-07",
    },
    "会津100さ1907": {
        model: "KC-MK211HN",
        serialNumber: "MK211HN00753",
        firstRegisteredYm: "1996-03",
    },
    "会津130せ70": {
        model: "QPG-FS1EPEA",
        serialNumber: "FS1EPE-10436",
        firstRegisteredYm: "2016-03",
    },
    "会津100は586": {
        model: "2PG-CYH77C",
        serialNumber: "CYH77C-7000071",
        firstRegisteredYm: "2018-06",
    },
    "会津100さ3340": {
        model: "NPR85AR",
        serialNumber: "NPR85-7013438",
        firstRegisteredYm: "2008-10",
    },
    "会津100さ3713": {
        model: "2RG-FRR90S",
        serialNumber: "FRR90-7173919",
        firstRegisteredYm: "2021-09",
    },
    "会津480え9666": {
        model: "5BD-DA17V",
        serialNumber: "DA17V-655751",
        firstRegisteredYm: "2022-12",
    },
    "会津400す1588": {
        model: "3BE-NCP165V",
        serialNumber: "NCP165-0124015",
        firstRegisteredYm: "2024-05",
    },
    "会津100は925": {
        model: "2PG-FJ2AECA",
        serialNumber: "FJ2AECA",
        firstRegisteredYm: "2010-06",
    },
    "会津800は397": {
        model: "SPG-FSR90S2",
        serialNumber: "FSR90-7004369",
        firstRegisteredYm: "2015-02",
    },
    "会津580え3060": {
        model: "DBA-LA300S",
        serialNumber: "LA300S1094931",
        firstRegisteredYm: "2012-05",
    },
    "会津100ゆ9": {
        model: "TF36H2C3",
        serialNumber: "TF36H2C3 83704",
        firstRegisteredYm: "2016-01",
    },
    "会津100は986": {
        model: "2DG-GW6EAH",
        serialNumber: null,
        firstRegisteredYm: "2025-12",
    },
    "福島100さ457": {
        model: "KK-MK252HB",
        serialNumber: "MK252H00271",
        firstRegisteredYm: "1999-08",
    },
    "会津100は6": {
        model: "PA-FSR34G4SZ",
        serialNumber: null,
        firstRegisteredYm: "2006-10",
    },
    "会津100は87": {
        model: "BDG-PK36C",
        serialNumber: "PK36C15121",
        firstRegisteredYm: "2009-11",
    },
    "会津580え7986": {
        model: "DBA-LA300S",
        serialNumber: "LA300S-1143491",
        firstRegisteredYm: "2013-03",
    },
    "会津100は564": {
        model: "2KG-FK62FZ",
        serialNumber: "FK62FZ-600058",
        firstRegisteredYm: "2018-01",
    },
    "会津100は624": {
        model: "2PG-CW5BL",
        serialNumber: null,
        firstRegisteredYm: "2019-02",
    },
    "会津400す1591": {
        model: "3BE-NCP165V",
        serialNumber: "NCP165-0123205",
        firstRegisteredYm: "2024-05",
    },
    "会津100は643": {
        model: "2KG-FS1EHA",
        serialNumber: "FS1EH-100381",
        firstRegisteredYm: "2019-01",
    },
    "会津100さ4392": {
        model: "TPG-NKR85R",
        serialNumber: null,
        firstRegisteredYm: "2017-07",
    },
    "福島88す6832": {
        model: "KC-NPS71GN",
        serialNumber: "NPS71G7400066",
        firstRegisteredYm: "1996-07",
    },
    "会津400さ4157": {
        model: "KR-KDH205V",
        serialNumber: "KDH205-5002666",
        firstRegisteredYm: "2005-11",
    },
    "会津100さ1608": {
        model: "TKG-XZU710",
        serialNumber: "XZU710-0006788",
        firstRegisteredYm: "2013-06",
    },
    "福島400せ5731": {
        model: "UB-NCP55V",
        serialNumber: "NCP550011185",
        firstRegisteredYm: "2003-06",
    },
    "会津100さ3585": {
        model: "2PG-FEB80",
        serialNumber: null,
        firstRegisteredYm: "2021-01",
    },
    "会津100は739": {
        model: null,
        serialNumber: null,
        firstRegisteredYm: "2021-01",
    },
    "会津800さ2733": {
        model: "KK-MK25A",
        serialNumber: "MK25A04213",
        firstRegisteredYm: "2003-12",
    },
    "会津100は783": {
        model: "2KG-FS1EHA",
        serialNumber: "FS1EH-100992",
        firstRegisteredYm: "2020-12",
    },
    "会津100ゆ14": {
        model: "KFKGG340",
        serialNumber: "KFKGG340-73690",
        firstRegisteredYm: "2011-05",
    },
    "会津100は850": {
        model: "QPG-GK5XAB",
        serialNumber: null,
        firstRegisteredYm: "2018-03",
    },
    "会津480か2066": {
        model: "EBD-DS17V",
        serialNumber: "DS17V-800071",
        firstRegisteredYm: "2015-04",
    },
    "会津100は955": {
        model: "LPG-FTR90S2",
        serialNumber: "FTR90-7004552",
        firstRegisteredYm: "2015-09",
    },
    "会津400さ709": {
        model: "KR-KDY280",
        serialNumber: "KDY2800015918",
        firstRegisteredYm: "2007-05",
    },
    "会津480あ4986": {
        model: "GBD-U72V",
        serialNumber: "U72V0402953",
        firstRegisteredYm: "2008-07",
    },
    "会津100は278": {
        model: "QDG-PW39L",
        serialNumber: "PW39L-20183",
        firstRegisteredYm: "2013-09",
    },
    "会津480い9619": {
        model: "HBD-DA64V",
        serialNumber: "DA64V-832001",
        firstRegisteredYm: "2014-03",
    },
    "会津100さ2267": {
        model: "TKG-MK38L",
        serialNumber: "MK38L-32105",
        firstRegisteredYm: "2015-09",
    },
    "会津400す1073": {
        model: "",
        serialNumber: "NCP165-0110629",
        firstRegisteredYm: "2023-05",
    },
    "会津100は689": {
        model: "TKG-FK65FY",
        serialNumber: "FK65FY-580059",
        firstRegisteredYm: "2013-10",
    },
    "会津330ち5810": {
        model: "6AA-AXVH75",
        serialNumber: "AXVH75-1004061",
        firstRegisteredYm: "2022-01",
    },
    "会津400さ8958": {
        model: "DBE－NCP55V",
        serialNumber: "NCP55－0102144",
        firstRegisteredYm: "2012-08",
    },
    "会津300た8678": {
        model: "3BA-NGX50",
        serialNumber: "NGX50-2040329",
        firstRegisteredYm: "2022-01",
    },
    "会津300わ353": {
        model: "ZVW30",
        serialNumber: "ZVW30-1811360",
        firstRegisteredYm: "2017-03",
    },
};

function parseYearMonthToFirstDay(value) {
    if (!value) return null;

    const [year, month] = value.split("-").map(Number);
    if (!year || !month) return null;

    return new Date(year, month - 1, 1);
}

function formatDateToYmd(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function buildVehicleInspectionReminders(firstRegisteredYm, endYear = 2050) {
    const baseDate = parseYearMonthToFirstDay(firstRegisteredYm);
    if (!baseDate) return [];

    const today = startOfToday();
    const reminders = [];

    // 初回3年後、その後2年ごと => 3,5,7,9...
    for (let offsetYears = 3; ; offsetYears += 2) {
        const dueDate = new Date(
            baseDate.getFullYear() + offsetYears,
            baseDate.getMonth(),
            1
        );

        if (dueDate.getFullYear() > endYear) {
            break;
        }

        if (dueDate < today) {
            continue;
        }

        const alertDate = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth() - 3,
            1
        );

        reminders.push({
            due_on: formatDateToYmd(dueDate),
            alert_on: formatDateToYmd(alertDate),
        });
    }

    return reminders;
}

function normalizeText(value) {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized === "" ? null : normalized;
}

function parseVehicleRow(line) {
    const parts = line.split(",").map((v) => v.trim());
    if (parts.length < 5) {
        throw new Error(`列数不足のため解析できません: ${line}`);
    }

    const registrationNumber = parts[0];
    const departmentCode = parts[1];
    const manufacturerName = normalizeText(parts[2]);
    const agencyLabel = parts[parts.length - 1];
    const middle = parts.slice(3, -1);

    let vehicleName = "";
    let typeName = "";

    if (middle.length === 0) {
        vehicleName = "";
        typeName = "";
    } else if (middle.length === 1) {
        // 5列行は「車名が空で、タイプだけがある」と解釈
        vehicleName = "";
        typeName = middle[0];
    } else {
        vehicleName = middle[0] ?? "";
        typeName = middle.slice(1).join(",");
    }

    return {
        registrationNumber,
        departmentCode,
        manufacturerName,
        vehicleName: normalizeText(vehicleName),
        typeName: normalizeText(typeName),
        agencyLabel,
    };
}

function resolveAgencyCompanyName(label) {
    switch (label) {
        case "コープ":
            return "三井住友海上";
        case "アスク":
            return "東京海上日動火災";
        case "三和倉庫":
            return "あいおいニッセイ";
        default:
            throw new Error(`未対応の代理店ラベルです: ${label}`);
    }
}

export async function seedVehicles() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const assets = supabase.schema("assets");
    const common = supabase.schema("common");

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

    // 部門一覧
    const { data: departments, error: depError } = await common
        .from("master_departments")
        .select("id, code");
    if (depError) {
        console.error("Error fetching master_departments:", depError.message);
        throw depError;
    }
    if (!departments?.length) {
        throw new Error("master_departments にデータがありません。");
    }

    // 保険カテゴリ一覧
    const { data: categories, error: catError } = await assets
        .from("master_insurance_categories")
        .select("id, code");
    if (catError) {
        console.error(
            "Error fetching master_insurance_categories:",
            catError.message
        );
        throw catError;
    }
    if (!categories?.length) {
        throw new Error(
            "master_insurance_categories にデータがありません。"
        );
    }

    const vehicleInsuranceCategory = categories.find(
        (c) => c.code === "vehicle_insurance"
    );
    if (!vehicleInsuranceCategory) {
        throw new Error(
            'insurance_category_code = "vehicle_insurance" のカテゴリが見つかりません。'
        );
    }

    // 保険契約先一覧
    const { data: agencies, error: agencyError } = await assets
        .from("master_insurance_agencies")
        .select("id, insurance_category_id, insurance_company_name");
    if (agencyError) {
        console.error(
            "Error fetching master_insurance_agencies:",
            agencyError.message
        );
        throw agencyError;
    }
    if (!agencies?.length) {
        throw new Error("master_insurance_agencies にデータがありません。");
    }

    const lines = RAW_ROWS.split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const vehicles = lines.map(parseVehicleRow);

    for (const item of vehicles) {
        const department = departments.find((d) => d.code === item.departmentCode);
        if (!department) {
            throw new Error(
                `department code が見つかりません: ${item.departmentCode}`
            );
        }

        const insuranceCompanyName = resolveAgencyCompanyName(item.agencyLabel);
        const agency = agencies.find(
            (a) =>
                a.insurance_category_id === vehicleInsuranceCategory.id &&
                a.insurance_company_name === insuranceCompanyName
        );

        if (!agency) {
            throw new Error(
                `代理店が見つかりません: label=${item.agencyLabel}, insurance_company_name=${insuranceCompanyName}`
            );
        }

        const metadata = VEHICLE_METADATA[item.registrationNumber] ?? {
            model: null,
            serialNumber: null,
            firstRegisteredYm: null,
            reminders: [],
        };

        const payload = {
            id: uuidv4(),
            registration_number: item.registrationNumber,
            department_id: department.id,
            manufacturer_name: item.manufacturerName,
            vehicle_name: item.vehicleName,
            type_name: item.typeName,
            model: metadata.model,
            serial_number: metadata.serialNumber,
            first_registered_ym: metadata.firstRegisteredYm,
            owner_name: null,
            is_fixed_asset: false,
            is_registered: true,
            voluntary_insurance_agency_id: agency.id,
            // compulsory_insurance_agency_name: null,
            note: null,
        };

        const { error } = await assets.from("vehicles").insert([payload]);

        if (error) {
            console.error("Insert vehicles error:", error, payload);
            throw error;
        }

        const vehicleId = payload.id;

        // VEHICLE_METADATA.reminders があればそれを優先、なければ firstRegisteredYm から自動生成
        const inspectionReminders =
            metadata.reminders?.length
                ? metadata.reminders
                : buildVehicleInspectionReminders(metadata.firstRegisteredYm);

        for (const r of inspectionReminders) {
            const reminderPayload = {
                target_type: "vehicle",
                target_id: vehicleId,
                reminder_type_code: "vehicle_inspection_expiry",
                reminder_type_name: "車検満了日",
                due_on: r.due_on,
                alert_on: r.alert_on,
                completed_on: null,
            };

            const { error: reminderErr } = await assets
                .from("reminders")
                .insert([reminderPayload]);

            if (reminderErr) {
                console.error("Insert reminders error:", reminderErr, reminderPayload);
                throw reminderErr;
            }
        }
    }

    console.log("vehicles seeded successfully!");
}
