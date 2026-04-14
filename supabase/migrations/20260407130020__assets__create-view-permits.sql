/*
=========================================================
assets.v_permits_list
許認可一覧用 View

【目的】
- permits 本体と reminders を突合し、
  一覧画面で使う表示用情報をまとめる
- permits テーブルには手動 status を持たず、
  reminders の日付から状態を自動算出する

【前提】
- reminders.target_type = 'permit' のレコードを対象にする
- reminder_type_code は少なくとも次を想定する
  - permit_expiry               : 有効期限そのもの
  - permit_alert                : 事前アラート
  - permit_submission_deadline  : 申請期限 / 提出期限
  - permit_other                : その他

【集計方針】
- expiry_on
  - permit_expiry の due_on の最小値
  - この View では「代表となる期限日」として扱う
- next_expiry_on
  - permit_expiry のうち、今日以降で最も近い due_on
- first_alert_on
  - permit_alert の due_on の最小値
- next_alert_on
  - permit_alert のうち、今日以降で最も近い due_on
- next_reminder_on
  - permit に紐づく reminders 全体のうち、今日以降で最も近い due_on
- reminder_count
  - permit に紐づく reminders 件数

【status 判定ルール】
1. calculated_status_code = 'unknown'
   - expiry_on が存在しない場合
   - つまり、有効期限に相当する reminder が未登録

2. calculated_status_code = 'expired'
   - expiry_on < current_date
   - 有効期限を過ぎている

3. calculated_status_code = 'alert_due'
   - expiry_on は存在する
   - かつ expiry_on は未経過
   - かつ first_alert_on <= current_date
   - つまり、有効期限前だがアラート期間に入っている

4. calculated_status_code = 'active'
   - expiry_on は存在する
   - かつ expiry_on は未経過
   - かつ alert_due ではない
   - つまり、通常の有効状態

【補足】
- first_alert_on は permit_alert の最小日付を使っているため、
  複数の alert を入れている場合は
  「最初の alert 日を過ぎた時点で alert_due」になる
- 手動ステータスは持たない
- 一覧画面での状態表示はこの View を正とする
=========================================================
*/
DROP view IF EXISTS assets.v_permits_list;
create or replace view assets.v_permits_list as
with reminder_summary as (
    select
        r.target_id as permit_id,

        min(case
            when r.reminder_type_code = 'permit_expiry'
            then r.due_on
        end) as expiry_on,

        min(case
            when r.reminder_type_code = 'permit_expiry'
             and r.due_on >= current_date
            then r.due_on
        end) as next_expiry_on,

        min(case
            when r.reminder_type_code = 'permit_alert'
            then r.due_on
        end) as first_alert_on,

        min(case
            when r.reminder_type_code = 'permit_alert'
             and r.due_on >= current_date
            then r.due_on
        end) as next_alert_on,

        min(case
            when r.due_on >= current_date
            then r.due_on
        end) as next_reminder_on,

        count(*) as reminder_count
    from assets.reminders r
    where r.target_type = 'permit'
    group by r.target_id
)
select
    p.id,

    p.category_id,
    pc.name as category_name,
    pc.sort_order as category_sort_order,

    p.subject_name,
    p.business_name,
    p.permit_number,
    p.issued_on,

    p.required_interval_label,

    p.requires_prior_certificate,
    p.note,
    p.created_at,
    msc.name as created_by_name,
    p.updated_at,
    msu.name as updated_by_name,
    p.deleted_at,
    msd.name as deleted_by_name,

    rs.expiry_on,
    rs.next_expiry_on,
    rs.first_alert_on,
    rs.next_alert_on,
    rs.next_reminder_on,
    coalesce(rs.reminder_count, 0) as reminder_count,

    case
        when rs.expiry_on is null then 'unknown'
        when rs.expiry_on < current_date then 'expired'
        when rs.first_alert_on is not null and rs.first_alert_on <= current_date then 'alert_due'
        else 'active'
    end as calculated_status_code,

    case
        when rs.expiry_on is null then '不明'
        when rs.expiry_on < current_date then '期限切れ'
        when rs.first_alert_on is not null and rs.first_alert_on <= current_date then '期限近い'
        else '有効'
    end as calculated_status_name,

    case
        when rs.expiry_on is null then null
        else (rs.expiry_on - current_date)
    end as days_until_expiry,

    case
        when rs.expiry_on is not null and rs.expiry_on < current_date then true
        else false
    end as is_expired,

    case
        when rs.expiry_on is null then false
        when rs.expiry_on < current_date then false
        when rs.first_alert_on is not null and rs.first_alert_on <= current_date then true
        else false
    end as is_alert_due

from assets.permits p
left join reminder_summary rs
    on rs.permit_id = p.id
left join assets.master_permit_categories pc
    on pc.id = p.category_id
LEFT JOIN common.master_staffs msc ON msc.id = p.created_by
LEFT JOIN common.master_staffs msu ON msu.id = p.updated_by
LEFT JOIN common.master_staffs msd ON msd.id = p.deleted_by

where p.deleted_at is null;

comment on view assets.v_permits_list is
'許認可一覧用View。reminders を基準に有効 / 期限切れ / 期限近い / 不明 を自動判定し、分類・更新周期ラベルはマスタ参照を優先して表示する。';
