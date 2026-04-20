import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const VALID_AT = "2026-01-01T00:00:00Z";
const INVALID_AT = "2050-12-31T00:00:00Z";

function normalizeText(value) {
    if (value == null) return null;
    const normalized = String(value)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n+/g, " ")
        .trim();

    if (!normalized || normalized === "－" || normalized === "-") {
        return null;
    }

    return normalized;
}

function buildAgencyRemarks({ insurancePeriod, remarks }) {
    const lines = [];
    const normalizedInsurancePeriod = normalizeText(insurancePeriod);
    const normalizedRemarks = normalizeText(remarks);

    if (normalizedInsurancePeriod) {
        lines.push(`保険期間: ${normalizedInsurancePeriod}`);
    }

    if (normalizedRemarks) {
        lines.push(normalizedRemarks);
    }

    return lines.length > 0 ? lines.join("\n") : null;
}

export async function seedMasterVehicleInsuranceCategories() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const assets = supabase.schema("assets");

    {
        const { error } = await assets
            .from("master_vehicle_insurance_categories")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error(
                "Delete master_vehicle_insurance_categories error:",
                error,
            );
            throw error;
        }
    }

    const categories = [
        {
            code: "vehicle_insurance",
            name: "自動車保険",
            sort_order: 100,
            update_note: `【定期更新】
①自動車保険一覧を全事業部に送り、車両の有無・保有事業部・不足等確認していただく
②担当者より更新時期前に保険料見積書と内容の変更提案あり
③事業部確認後の一覧と見積の車両が合っているか確認
③担当者より受けた内容を説明し、社長がプラン等決定
④保険申込書対応
⑤保険証券が届いたら、見積時の金額と確認
⑥自動車保険一覧を更新し、各事業部・経理担当へ連絡
【新規申込】
①加入保険会社（代理店）を社長に確認。車両保険の有無も社長・事業部長に確認
②車検証・注文書・請求書を送付し、加入日を伝える
③保険申込書対応し、会社控えの写しを経理担当者へ
④保険証券が届いたら写しを経理担当者へ
【解約申込】
①解約日を担当者へ連絡
②解約申込対応
③戻しの保険料の案内を経理担当者へ`,
            accident_internal_note: `【保険会社対応】
①担当者へ事故の第一報
②事故報告書・写真・運転者とお相手の情報を連絡
※アスクのみ「あんしんFAX自動車事故受付票」を作成・送信しないと事故受付されない
③担当者からの質問事項対応`,
            accident_external_note: `【事業部対応】
①対象車両・状況・お相手情報確認
②補償内容確認し事業部長へ連絡。車両保険使用しての修理かなど確認。
③事故報告書至急対応依頼。`,
        },
        {
            code: "facility_liability_insurance",
            name: "施設賠償責任保険",
            sort_order: 200,
            update_note: `①前期売上高を担当者へ連絡
②見積書確認、社長決裁
③保険申込対応
④前期施設賠償責任保険使用の事故件数確認し、経費案分一覧を作成
　全事業部・経理担当者へ連絡`,
            accident_internal_note: `【保険会社対応】
①担当者へ事故の第一報
②事故報告書・写真・お相手の情報を連絡
③担当者からの質問事項対応
④保険金請求対応`,
            accident_external_note: `【事業部対応】
①状況・お相手情報確認
②事故報告書至急対応依頼`,
        },
        {
            code: "occupational_accident_insurance",
            name: "業務災害補償保険",
            sort_order: 300,
            update_note: `①前期売上高を担当者へ連絡
②見積書確認、社長決裁
③保険申込対応
④保険料を経理担当者へ`,
            accident_internal_note: `【保険会社対応】
①担当者へ事故の第一報
②事故報告書・写真・お相手の情報を連絡
③担当者からの質問事項対応
④保険金請求対応`,
            accident_external_note: `【事業部対応】
①状況確認
②事故報告書至急対応依頼`,
        },
        {
            code: "fire_insurance",
            name: "火災保険保険",
            sort_order: 400,
            update_note: `①保険対象事業所での増減確認・保険会社へ連絡
②見積書確認、社長決裁
③保険申込対応
④保険内容・保険料を個社と対象事業部、経理担当者へ連絡`,
            accident_internal_note: `【保険会社対応】
①担当者へ事故の第一報
②事故報告書・写真等の情報を連絡
③担当者からの質問事項対応
④保険金請求対応`,
            accident_external_note: `【事業部対応】
①状況確認
②事故報告書至急対応依頼`,
        },
        {
            code: "information_leakage_insurance",
            name: "情報漏洩保険",
            sort_order: 500,
            update_note: `①確認シートを担当者へ提出
②見積書確認、社長決裁
③保険申込対応
④保険料を経理担当者へ`,
            accident_internal_note: `【保険会社対応】
①担当者へ事故の第一報
②指示に従い対応`,
            accident_external_note: "",
        },
    ];

    for (const category of categories) {
        const payload = {
            id: uuidv4(),
            code: category.code,
            name: category.name,
            sort_order: category.sort_order,
            remarks: null,
            update_note: normalizeText(category.update_note),
            accident_internal_note: normalizeText(
                category.accident_internal_note,
            ),
            accident_external_note: normalizeText(
                category.accident_external_note,
            ),
            valid_at: VALID_AT,
            invalid_at: INVALID_AT,
        };

        const { error } = await assets
            .from("master_vehicle_insurance_categories")
            .insert([payload]);
        if (error) {
            console.error(
                "Insert master_vehicle_insurance_categories error:",
                error,
            );
            throw error;
        }
    }

    console.log("master_vehicle_insurance_categories seeded successfully!");
}

export async function seedMasterVehicleInsuranceAgencies() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const assets = supabase.schema("assets");

    {
        const { error } = await assets
            .from("master_vehicle_insurance_agencies")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error(
                "Delete master_vehicle_insurance_agencies error:",
                error,
            );
            throw error;
        }
    }

    const { data: categoryRows, error: categoryError } = await assets
        .from("master_vehicle_insurance_categories")
        .select("id, code");
    if (categoryError) {
        console.error(
            "Select master_vehicle_insurance_categories error:",
            categoryError,
        );
        throw categoryError;
    }

    const categoryIdByCode = new Map(
        (categoryRows ?? []).map((row) => [row.code, row.id]),
    );

    const agencies = [
        {
            insurance_category_code: "vehicle_insurance",
            insurance_company_name: "三井住友海上",
            agency_name: "㈲あいづ協同サービス",
            contact_person_name: "小寺 秀一",
            mobile_phone: "080-4058-4241",
            tel: "0241-22-7171",
            fax: "0241-22-0865",
            insurance_period: "1/1～翌年1/1",
            remarks: "",
        },
        {
            insurance_category_code: "vehicle_insurance",
            insurance_company_name: "東京海上日動火災",
            agency_name: "㈱アスク",
            contact_person_name: "安斎 彰広",
            mobile_phone: "090-0996-6701",
            tel: "0243-22-0555",
            fax: "0243-22-2100",
            insurance_period: "1/1～翌年1/1",
            remarks: "",
        },
        {
            insurance_category_code: "vehicle_insurance",
            insurance_company_name: "あいおいニッセイ",
            agency_name: "三和倉庫㈱",
            contact_person_name: "伊藤 真人",
            mobile_phone: null,
            tel: "03-3578-3008",
            fax: null,
            insurance_period: "1/1～翌年1/1",
            remarks: "",
        },
        {
            insurance_category_code: "facility_liability_insurance",
            insurance_company_name: "三井住友海上",
            agency_name: "㈲あいづ協同サービス",
            contact_person_name: "小寺 秀一",
            mobile_phone: "080-4058-4241",
            tel: "0241-22-7171",
            fax: "0241-22-0865",
            insurance_period: "12/21～翌年12/21",
            remarks:
                "https://www.ms-ins.com/pdf/business/indemnity/biz-protector-ci.pdf",
        },
        {
            insurance_category_code: "occupational_accident_insurance",
            insurance_company_name: "三井住友海上",
            agency_name: "㈲あいづ協同サービス",
            contact_person_name: "小寺 秀一",
            mobile_phone: "080-4058-4241",
            tel: "0241-22-7171",
            fax: "0241-22-0865",
            insurance_period: "1/1～翌年1/1",
            remarks: "https://www.ms-ins.com/pdf/business/employee/j-next.pdf",
        },
        {
            insurance_category_code: "fire_insurance",
            insurance_company_name: "三井住友海上",
            agency_name: "㈲あいづ協同サービス",
            contact_person_name: "小寺 秀一",
            mobile_phone: "080-4058-4241",
            tel: "0241-22-7171",
            fax: "0241-22-0865",
            insurance_period: "8/1～翌年8/1",
            remarks: "",
        },
        {
            insurance_category_code: "information_leakage_insurance",
            insurance_company_name: "全国商工会議所",
            agency_name: "㈱アスク",
            contact_person_name: "安斎 彰広",
            mobile_phone: "090-0996-6701",
            tel: "0243-22-0555",
            fax: "0243-22-2100",
            insurance_period: "3/1～翌年3/1",
            remarks: "",
        },
    ];

    for (const agency of agencies) {
        const insuranceCategoryId = categoryIdByCode.get(
            agency.insurance_category_code,
        );
        if (!insuranceCategoryId) {
            throw new Error(
                `insurance_category_code=${agency.insurance_category_code} に対応するカテゴリが存在しません。先に seedMasterVehicleInsuranceCategories() を実行してください。`,
            );
        }

        const payload = {
            id: uuidv4(),
            insurance_category_id: insuranceCategoryId,
            insurance_company_name: normalizeText(
                agency.insurance_company_name,
            ),
            agency_name: normalizeText(agency.agency_name),
            contact_person_name: normalizeText(agency.contact_person_name),
            mobile_phone: normalizeText(agency.mobile_phone),
            tel: normalizeText(agency.tel),
            fax: normalizeText(agency.fax),
            remarks: buildAgencyRemarks({
                insurancePeriod: agency.insurance_period,
                remarks: agency.remarks,
            }),
            valid_at: VALID_AT,
            invalid_at: INVALID_AT,
        };

        const { error } = await assets
            .from("master_vehicle_insurance_agencies")
            .insert([payload]);
        if (error) {
            console.error(
                "Insert master_vehicle_insurance_agencies error:",
                error,
            );
            throw error;
        }
    }

    console.log("master_vehicle_insurance_agencies seeded successfully!");
}
