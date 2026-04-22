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


/*
=========================================================
assets.v_permit_reminders
許認可詳細画面用 View

【目的】
- assets.reminders のうち、target_type = 'permit' のものだけを
  許認可向けに見やすく取り出す
- permits 詳細画面で「個別日付一覧」としてそのまま使う

【用途】
- permit_id を条件に一覧表示する
- due_on 昇順で並べて、期限・通知・提出期限などを確認する
- reminder の追加 / 編集 / 削除の対象一覧として使う

【前提】
- reminders は「実際に管理したい通知日そのもの」を持つ
- 自動繰り返しルールは持たない
- permit ごとの将来予定日を必要な分だけ直接登録する

【permit で想定する reminder_type_code】
- permit_expiry
  有効期限そのもの
- permit_alert
  事前アラート
- permit_submission_deadline
  提出期限 / 申請期限
- permit_other
  その他の個別日付

【補足】
- 本 View は reminders の生値をそのまま見せる用途
- status の自動判定は assets.v_permits_list 側で行う
=========================================================
*/
DROP view IF EXISTS assets.v_permit_reminders;
create or replace view assets.v_permit_reminders as
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
    r.target_id as permit_id,

    p.category_id,
    p.subject_name,
    p.business_name,
    p.permit_number,
    p.required_interval_label,
    p.issued_on,
    p.requires_prior_certificate,
    p.note as permit_note,

    r.reminder_type_code,
    r.reminder_type_name,
    r.due_on,
    r.alert_on,
    r.completed_on,
    r.created_at,
    r.updated_at,

    coalesce(rc.comment_count, 0) as comment_count,
    coalesce(rc.comments, '[]'::jsonb) as comments

from assets.reminders r
inner join assets.permits p
    on p.id = r.target_id
left join reminder_comments rc
    on rc.reminder_id = r.id
where r.target_type = 'permit'
    and p.deleted_at is null;

comment on view assets.v_permit_reminders is
'許認可通知・メール送信用View。assets.reminders の target_type=permit を assets.permits と結合し、一覧表示や通知送信で使う。';

comment on column assets.v_permit_reminders.id is
'通知レコードID。assets.reminders.id。';

comment on column assets.v_permit_reminders.target_type is
'通知対象種別。permit 固定。';

comment on column assets.v_permit_reminders.permit_id is
'通知対象の許認可ID。assets.permits.id。';

comment on column assets.v_permit_reminders.category_id is
'許認可の分類名。メール本文や一覧見出しで利用する。';

comment on column assets.v_permit_reminders.subject_name is
'許認可の対象名・タイトル。メール件名や本文で主に利用する。';

comment on column assets.v_permit_reminders.business_name is
'対象事業・業務名。どの事業の許認可かをメール本文で表現するために利用する。';

comment on column assets.v_permit_reminders.permit_number is
'許可番号。必要に応じてメール本文や詳細画面で利用する。';

comment on column assets.v_permit_reminders.required_interval_label is
'更新頻度メモ。例: 2年ごと / 5年ごと更新。';

comment on column assets.v_permit_reminders.issued_on is
'許可日 / 発行日。';

comment on column assets.v_permit_reminders.requires_prior_certificate is
'先行許可証の提示要否。';

comment on column assets.v_permit_reminders.permit_note is
'許認可本体の備考。assets.permits.note。';

comment on column assets.v_permit_reminders.reminder_type_code is
'通知種別コード。permit_expiry / permit_alert / permit_submission_deadline / permit_other などを利用する。';

comment on column assets.v_permit_reminders.reminder_type_name is
'通知種別名。例: 有効期限 / 事前アラート / 申請期限 / 個別日付。';

comment on column assets.v_permit_reminders.due_on is
'実際に管理したい対象日。有効期限や提出期限などの本体日付。';

comment on column assets.v_permit_reminders.alert_on is
'通知したい日。due_on の前倒し通知日などを入れる。';

comment on column assets.v_permit_reminders.completed_on is
'対応完了日。';

comment on column assets.v_permit_reminders.created_at is
'通知レコード作成日時。';

comment on column assets.v_permit_reminders.updated_at is
'通知レコード更新日時。';
