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
