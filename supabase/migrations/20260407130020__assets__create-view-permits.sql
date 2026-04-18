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
  - 未完了の permit_expiry のうち、最も近い due_on
  - 未完了が無い場合は null
  - つまり「次に管理対象となる有効期限」が未登録なら不明扱い

- next_expiry_on
  - 未完了かつ今日以降の permit_expiry のうち最も近い due_on

- alert_on
  - 未完了の permit_alert のうち最も近い due_on
  - 一覧画面の alert_due 判定の基準に使う

- next_alert_on
  - 未完了かつ今日以降の permit_alert のうち最も近い due_on

- next_reminder_on
  - 未完了かつ今日以降の reminders 全体のうち最も近い due_on

- reminder_count
  - permit に紐づく reminders 件数（completed / incomplete 含む）

- incomplete_reminder_count
  - permit に紐づく未完了 reminders 件数

【status 判定ルール】
1. calculated_status_code = 'unknown'
   - expiry_on が存在しない場合
   - つまり、次に管理対象となる permit_expiry が未登録

2. calculated_status_code = 'expired'
   - expiry_on < current_date
   - 未完了の有効期限がすでに過去日

3. calculated_status_code = 'alert_due'
   - expiry_on は存在する
   - かつ expiry_on は未経過
   - かつ alert_on <= current_date
   - つまり、有効期限前だがアラート期間に入っている

4. calculated_status_code = 'active'
   - expiry_on は存在する
   - かつ expiry_on は未経過
   - かつ alert_due ではない
   - つまり、通常の有効状態

【補足】
- 手動ステータスは持たない
- 一覧画面での状態表示はこの View を正とする
- expiry_on is null の場合は、UI 側で
  「次回有効期限リマインダ未登録」などの導線を出す想定
=========================================================
*/
drop view if exists assets.v_permits_list;

create or replace view assets.v_permits_list as
with reminder_summary as (
    select
        r.target_id as permit_id,

        /*
         * 現在の代表有効期限
         * 未完了 permit_expiry のうち最も近い due_on
         * 未完了が無ければ null
         */
        min(case
            when r.reminder_type_code = 'permit_expiry'
             and r.completed_on is null
            then r.due_on
        end) as expiry_on,

        /*
         * 今日以降で次に来る未完了の有効期限
         */
        min(case
            when r.reminder_type_code = 'permit_expiry'
             and r.completed_on is null
             and r.due_on >= current_date
            then r.due_on
        end) as next_expiry_on,

        /*
         * 現在の代表アラート日
         * 未完了 permit_alert のうち最も近い due_on
         */
        min(case
            when r.reminder_type_code = 'permit_alert'
             and r.completed_on is null
            then r.due_on
        end) as alert_on,

        /*
         * 今日以降で次に来る未完了アラート日
         */
        min(case
            when r.reminder_type_code = 'permit_alert'
             and r.completed_on is null
             and r.due_on >= current_date
            then r.due_on
        end) as next_alert_on,

        /*
         * 今日以降で次に来る未完了 reminder 全体
         */
        min(case
            when r.completed_on is null
             and r.due_on >= current_date
            then r.due_on
        end) as next_reminder_on,

        count(*) as reminder_count,

        count(*) filter (
            where r.completed_on is null
        ) as incomplete_reminder_count

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
    rs.alert_on,
    rs.next_alert_on,
    rs.next_reminder_on,

    coalesce(rs.reminder_count, 0) as reminder_count,
    coalesce(rs.incomplete_reminder_count, 0) as incomplete_reminder_count,

    case
        when rs.expiry_on is null then 'unknown'
        when rs.expiry_on < current_date then 'expired'
        when rs.alert_on is not null and rs.alert_on <= current_date then 'alert_due'
        else 'active'
    end as calculated_status_code,

    case
        when rs.expiry_on is null then '不明'
        when rs.expiry_on < current_date then '期限切れ'
        when rs.alert_on is not null and rs.alert_on <= current_date then '期限近い'
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
        when rs.alert_on is not null and rs.alert_on <= current_date then true
        else false
    end as is_alert_due

from assets.permits p
left join reminder_summary rs
    on rs.permit_id = p.id
left join assets.master_permit_categories pc
    on pc.id = p.category_id
left join common.master_staffs msc
    on msc.id = p.created_by
left join common.master_staffs msu
    on msu.id = p.updated_by
left join common.master_staffs msd
    on msd.id = p.deleted_by
where p.deleted_at is null;

comment on view assets.v_permits_list is
'許認可一覧用View。reminders を基準に有効 / 期限切れ / 期限近い / 不明 を自動判定する。expiry_on は未完了の permit_expiry のうち最も近い due_on を採用し、未完了が無い場合は null とする。';



/*
=========================================================
assets.v_comments_list
許認可コメント一覧用 View
=========================================================
*/
drop view if exists assets.v_comments_list;

create or replace view assets.v_comments_list as
select
    c.id,
    c.target_type,
    c.target_id,
    -- c.comment_type_code,
    c.body,
    c.source_type,
    -- c.reminder_id,

    c.created_at,
    c.created_by,
    msc.name as created_by_name,

    c.updated_at,
    c.updated_by,
    msu.name as updated_by_name

from assets.comments c
left join common.master_staffs msc
    on msc.id = c.created_by
left join common.master_staffs msu
    on msu.id = c.updated_by;

comment on view assets.v_comments_list is
'コメント一覧表示用View。comments に作成者名・更新者名を付与して返す。';
