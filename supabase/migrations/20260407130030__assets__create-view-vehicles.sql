/*
=========================================================
assets.v_vehicles_list
車両一覧用 View

【目的】
- vehicles 本体と reminders を突合し、
  一覧画面で使う表示用情報をまとめる
- vehicles テーブルには車検満了日や任意保険満了日を直接持たず、
  reminders の日付から一覧表示用の期限情報を導出する

【前提】
- reminders.target_type = 'vehicle' のレコードを対象にする
- 現時点の reminder_type_code は少なくとも次を想定する
  - vehicle_inspection_expiry
      : 車検満了日
  - vehicle_voluntary_insurance_expiry
      : 任意保険満了日

【完了判定】
- reminders.completed_on is null
  : 未完了
- reminders.completed_on is not null
  : 完了済み

【集計方針】
- inspection_expiry_on
  - 未完了の vehicle_inspection_expiry のうち、
    最も近い due_on
  - 未完了が無い場合は null
  - つまり「次に管理対象となる車検満了日」が未登録なら null

- inspection_alert_on
  - inspection_expiry_on と同じレコードの alert_on
  - 一覧画面で車検アラート表示を行う基準に使う

- voluntary_insurance_expiry_on
  - 未完了の vehicle_voluntary_insurance_expiry のうち、
    最も近い due_on
  - 未完了が無い場合は null
  - つまり「次に管理対象となる任意保険満了日」が未登録なら null

- voluntary_insurance_alert_on
  - voluntary_insurance_expiry_on と同じレコードの alert_on
  - 一覧画面で任意保険アラート表示を行う基準に使う

【抽出方針】
- 各 reminder_type_code ごとに、
  target_id = vehicle.id 単位で
  due_on が最も近い未完了 reminder を 1 件だけ採用する
- 未完了 = completed_on is null
- 過去日 / 未来日は区別せず、
  まずは「未完了のうち最も近い期限」を一覧用の代表値とする

【結合方針】
- vehicles.department_id -> common.master_departments.id で部門名を取得する
- vehicles.voluntary_insurance_agency_id
    -> assets.master_insurance_agencies.id
  で任意保険契約先を取得する
- 保険契約先から
    assets.master_insurance_categories
  を辿って保険カテゴリ情報を取得する

【補足】
- 手動ステータスは持たない
- 現時点では calculated_status_code のような
  全体状態列はまだ持たない
  - 車両は複数の期限を持つため、
    まずは期限列をそのまま一覧に返す方針とする
- 論理削除済み vehicles は一覧対象外とする
- inspection_expiry_on / voluntary_insurance_expiry_on が null の場合は、
  UI 側で
  「車検リマインダ未登録」
  「任意保険リマインダ未登録」
  などの導線を出す想定
=========================================================
*/
create or replace view assets.v_vehicles_list as
with inspection_reminders as (
    select distinct on (r.target_id)
        r.target_id as vehicle_id,
        r.id as reminder_id,
        r.due_on,
        r.alert_on,
        r.completed_on
    from assets.reminders r
    where r.target_type = 'vehicle'
      and r.reminder_type_code = 'vehicle_inspection_expiry'
      and r.completed_on is null
    order by r.target_id, r.due_on asc nulls last, r.created_at asc
),
voluntary_insurance_reminders as (
    select distinct on (r.target_id)
        r.target_id as vehicle_id,
        r.id as reminder_id,
        r.due_on,
        r.alert_on,
        r.completed_on
    from assets.reminders r
    where r.target_type = 'vehicle'
      and r.reminder_type_code = 'vehicle_voluntary_insurance_expiry'
      and r.completed_on is null
    order by r.target_id, r.due_on asc nulls last, r.created_at asc
)
select
    v.id,
    v.registration_number,
    v.department_id,
    d.name as department_name,
    v.manufacturer_name,
    v.vehicle_name,
    v.type_name,
    v.model,
    v.serial_number,
    v.first_registered_ym,
    v.owner_name,
    v.is_fixed_asset,
    v.is_registered,
    v.voluntary_insurance_agency_id,
    ic.id as voluntary_insurance_category_id,
    ic.code as voluntary_insurance_category_code,
    ic.name as voluntary_insurance_category_name,
    ia.insurance_company_name as voluntary_insurance_company_name,
    ia.agency_name as voluntary_insurance_agency_name,
    ia.contact_person_name as voluntary_insurance_contact_person_name,
    ia.mobile_phone as voluntary_insurance_mobile_phone,
    ia.tel as voluntary_insurance_tel,
    ia.fax as voluntary_insurance_fax,
    -- v.compulsory_insurance_agency_name,

    ir.reminder_id as inspection_reminder_id,
    ir.due_on as inspection_expiry_on,
    ir.alert_on as inspection_alert_on,

    vir.reminder_id as voluntary_insurance_reminder_id,
    vir.due_on as voluntary_insurance_expiry_on,
    vir.alert_on as voluntary_insurance_alert_on,

    v.note,
    v.created_at,
    v.updated_at,
    v.created_by,
    v.updated_by,
    v.deleted_at
from assets.vehicles v
left join common.master_departments d
    on d.id = v.department_id
left join assets.master_insurance_agencies ia
    on ia.id = v.voluntary_insurance_agency_id
left join assets.master_insurance_categories ic
    on ic.id = ia.insurance_category_id
left join inspection_reminders ir
    on ir.vehicle_id = v.id
left join voluntary_insurance_reminders vir
    on vir.vehicle_id = v.id
where v.deleted_at is null;

comment on view assets.v_vehicles_list is '車両一覧用View';



/*
=========================================================
assets.v_vehicle_reminders
車両リマインダ詳細用 View

【目的】
- reminders と vehicles 本体を突合し、
  車両詳細画面やリマインダ一覧で使う表示用情報をまとめる
- reminder 単体では分からない車両情報
  （登録番号 / 部門 / メーカー名 / 車名 / 保険契約先など）
  を一緒に取得できるようにする

【前提】
- reminders.target_type = 'vehicle' のレコードを対象にする
- 現時点の reminder_type_code は少なくとも次を想定する
  - vehicle_inspection_expiry
      : 車検満了日
  - vehicle_voluntary_insurance_expiry
      : 任意保険満了日

【完了判定】
- reminders.completed_on is null
  : 未完了
- reminders.completed_on is not null
  : 完了済み

【結合方針】
- reminders.target_id = vehicles.id で vehicles と結合する
- vehicles.department_id -> common.master_departments.id で部門名を取得する
- vehicles.voluntary_insurance_agency_id
    -> assets.master_insurance_agencies.id
  で任意保険契約先を取得する
- 保険契約先から
    assets.master_insurance_categories
  を辿って保険カテゴリ情報を取得する

【用途】
- 車両詳細画面での reminder 一覧表示
- reminder 編集対象の確認表示
- reminder CSV / PDF 出力時の元データ
- reminder_type_code ごとの絞り込み表示

【補足】
- comments はこの View にはまだ集約しない
  - reminder に対するコメントは
    comments.target_type = 'reminder'
    comments.target_id = reminder.id
    で別途扱う
- 論理削除済み vehicles は対象外とする
- reminder の状態判定そのものはこの View では持たず、
  due_on / alert_on / completed_on をそのまま返す
=========================================================
*/
DROP view IF EXISTS assets.v_vehicle_reminders;
create or replace view assets.v_vehicle_reminders as
with reminder_comments as (
    select
        c.target_id as reminder_id,
        count(*) as comment_count,
        jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'body', c.body,
                'source_type', c.source_type,
                'created_at', c.created_at,
                'created_by', c.created_by,
                'created_by_name', msc.name,
                'updated_at', c.updated_at,
                'updated_by', c.updated_by,
                'updated_by_name', msu.name
            )
            order by c.created_at desc, c.id desc
        ) as comments
    from assets.comments c
    left join common.master_staffs msc
      on msc.id = c.created_by
    left join common.master_staffs msu
      on msu.id = c.updated_by
    where c.target_type = 'reminder'
    group by c.target_id
)
select
    r.id,
    r.target_type,
    r.target_id as vehicle_id,
    r.reminder_type_code,
    r.reminder_type_name,
    r.due_on,
    r.alert_on,
    r.completed_on,
    r.created_at as reminder_created_at,
    r.created_by as reminder_created_by,
    r.updated_at as reminder_updated_at,
    r.updated_by as reminder_updated_by,

    v.registration_number,
    v.department_id,
    d.name as department_name,
    v.manufacturer_name,
    v.vehicle_name,
    v.type_name,
    v.model,
    v.serial_number,
    v.first_registered_ym,
    v.owner_name,
    v.is_fixed_asset,
    v.is_registered,
    v.voluntary_insurance_agency_id,
    ic.id as voluntary_insurance_category_id,
    ic.code as voluntary_insurance_category_code,
    ic.name as voluntary_insurance_category_name,
    ia.insurance_company_name as voluntary_insurance_company_name,
    ia.agency_name as voluntary_insurance_agency_name,
    ia.contact_person_name as voluntary_insurance_contact_person_name,
    ia.mobile_phone as voluntary_insurance_mobile_phone,
    ia.tel as voluntary_insurance_tel,
    ia.fax as voluntary_insurance_fax,
    -- v.compulsory_insurance_agency_name,
    v.note as vehicle_note,
    v.created_at as vehicle_created_at,
    v.updated_at as vehicle_updated_at,

    coalesce(rc.comment_count, 0) as comment_count,
    coalesce(rc.comments, '[]'::jsonb) as comments

from assets.reminders r
inner join assets.vehicles v
    on v.id = r.target_id
    and r.target_type = 'vehicle'
left join reminder_comments rc
    on rc.reminder_id = r.id
left join common.master_departments d
    on d.id = v.department_id
left join assets.master_insurance_agencies ia
    on ia.id = v.voluntary_insurance_agency_id
left join assets.master_insurance_categories ic
    on ic.id = ia.insurance_category_id
where v.deleted_at is null;

comment on view assets.v_vehicle_reminders is '車両リマインダ詳細用View';
