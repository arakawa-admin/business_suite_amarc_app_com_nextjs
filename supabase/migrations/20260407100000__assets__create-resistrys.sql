-- =========================================================
-- Extensions
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- Schema
-- =========================================================
create schema if not exists assets;

-- =========================================================
-- updated_at trigger function
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- assets.attachments
-- 添付ファイル共通台帳
-- =========================================================
drop table if exists assets.attachments cascade;

create table if not exists assets.attachments (
    id uuid primary key default gen_random_uuid(),

    storage_bucket text not null default 'assets',
    storage_key text not null,
    original_filename text not null,
    content_type text null,
    byte_size bigint not null,
    sha256 text null,

    thumbnail_storage_key text null,
    thumbnail_content_type text null,
    thumbnail_byte_size bigint null,

    remarks text null,

    linked_at timestamptz null,

    uploaded_by uuid null,
    uploaded_at timestamptz not null default now(),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    deleted_at timestamptz null,
    deleted_by uuid null,

    constraint uq_assets_attachments_storage_key
        unique (storage_key),

    constraint chk_assets_attachments_byte_size
        check (byte_size >= 0)
);

comment on table assets.attachments is '添付ファイル共通台帳。R2上のファイル本体に対応するメタ情報を保持する';
comment on column assets.attachments.storage_bucket is '保存先バケット名';
comment on column assets.attachments.storage_key is 'R2上のオブジェクトキー';
comment on column assets.attachments.original_filename is '元ファイル名';
comment on column assets.attachments.content_type is 'MIMEタイプ';
comment on column assets.attachments.byte_size is 'ファイルサイズ（byte）';
comment on column assets.attachments.sha256 is '重複判定や整合性確認用ハッシュ';
comment on column assets.attachments.thumbnail_storage_key is 'サムネイル画像のR2オブジェクトキー';
comment on column assets.attachments.thumbnail_content_type is 'サムネイル画像のMIMEタイプ';
comment on column assets.attachments.thumbnail_byte_size is 'サムネイル画像のファイルサイズ（byte）';
comment on column assets.attachments.remarks is '備考';
comment on column assets.attachments.linked_at is '業務レコードに初めて関連付いた日時。null は未確定の仮アップロード cronで定期削除される';
comment on column assets.attachments.uploaded_by is 'アップロード実行者 staff id';
comment on column assets.attachments.uploaded_at is 'アップロード日時';
comment on column assets.attachments.deleted_at is '論理削除日時';
comment on column assets.attachments.deleted_by is '論理削除実行者 staff id';

alter table assets.attachments
    drop constraint if exists fk_assets_attachments_uploaded_by;
alter table assets.attachments
    add constraint fk_assets_attachments_uploaded_by
    foreign key (uploaded_by) references common.master_staffs(id);

alter table assets.attachments
    drop constraint if exists fk_assets_attachments_deleted_by;
alter table assets.attachments
    add constraint fk_assets_attachments_deleted_by
    foreign key (deleted_by) references common.master_staffs(id);

create index if not exists idx_assets_attachments_uploaded_at
    on assets.attachments (uploaded_at desc);

create index if not exists idx_assets_attachments_sha256
    on assets.attachments (sha256);

drop trigger if exists trg_assets_attachments_updated_at
    on assets.attachments;
create trigger trg_assets_attachments_updated_at
before update on assets.attachments
for each row
execute function public.set_updated_at();


-- =========================================================
-- assets.attachment_links
-- 添付ファイルの汎用紐付け
-- target_type + target_id の多態関連
-- =========================================================
drop table if exists assets.attachment_links cascade;

create table if not exists assets.attachment_links (
    id uuid primary key default gen_random_uuid(),

    attachment_id uuid not null,
    target_type text not null,
    target_id uuid not null,

    attachment_role text null,
    sort_order integer not null default 0,

    created_at timestamptz not null default now(),
    created_by uuid null,

    updated_at timestamptz not null default now(),

    deleted_at timestamptz null,
    deleted_by uuid null,

    constraint chk_assets_attachment_links_sort_order
        check (sort_order >= 0)
);

comment on table assets.attachment_links is '添付ファイルの汎用紐付け';
comment on column assets.attachment_links.target_type is '対象種別。例: permit, permit_renewal_log, vehicle, vehicle_insurance, vehicle_inspection_log';
comment on column assets.attachment_links.target_id is '対象レコードID';
comment on column assets.attachment_links.attachment_role is '添付の役割。例: permit_certificate, insurance_policy, inspection_report';
comment on column assets.attachment_links.sort_order is '表示順';
comment on column assets.attachment_links.created_by is '紐付け作成者 staff id';
comment on column assets.attachment_links.deleted_by is '紐付け解除者 staff id';

alter table assets.attachment_links
    drop constraint if exists fk_assets_attachment_links_attachment;
alter table assets.attachment_links
    add constraint fk_assets_attachment_links_attachment
    foreign key (attachment_id) references assets.attachments(id) on delete cascade;

alter table assets.attachment_links
    drop constraint if exists chk_assets_attachment_links_target_type;
alter table assets.attachment_links
    add constraint chk_assets_attachment_links_target_type
    check (
        target_type in (
            'permit',
            'permit_renewal_log',
            'vehicle',
            'vehicle_insurance',
            'vehicle_inspection_log'
        )
    );

alter table assets.attachment_links
    drop constraint if exists fk_assets_attachment_links_created_by;
alter table assets.attachment_links
    add constraint fk_assets_attachment_links_created_by
    foreign key (created_by) references common.master_staffs(id);

alter table assets.attachment_links
    drop constraint if exists fk_assets_attachment_links_deleted_by;
alter table assets.attachment_links
    add constraint fk_assets_attachment_links_deleted_by
    foreign key (deleted_by) references common.master_staffs(id);

create unique index if not exists uq_assets_attachment_links_active
    on assets.attachment_links (attachment_id, target_type, target_id)
    where deleted_at is null;

create index if not exists idx_assets_attachment_links_target
    on assets.attachment_links (target_type, target_id)
    where deleted_at is null;

create index if not exists idx_assets_attachment_links_attachment
    on assets.attachment_links (attachment_id)
    where deleted_at is null;

drop trigger if exists trg_assets_attachment_links_updated_at
    on assets.attachment_links;
create trigger trg_assets_attachment_links_updated_at
before update on assets.attachment_links
for each row
execute function public.set_updated_at();


-- =========================================================
-- assets.reminders
-- 許認可・保険・点検などの共通リマインド/予定
-- =========================================================
drop table if exists assets.reminders cascade;

create table if not exists assets.reminders (
    id uuid primary key default gen_random_uuid(),

    target_type text not null,
    target_id uuid not null,

    reminder_type_code text not null,
    reminder_type_name text not null,

    due_on date null,
    alert_on date null,
    completed_on date null,

    created_at timestamptz not null default now(),
    created_by uuid null,

    updated_at timestamptz not null default now(),
    updated_by uuid null
);

comment on table assets.reminders is '共通リマインド・予定';
comment on column assets.reminders.target_type is '対象種別。例: permit, permit_renewal_log, vehicle, vehicle_insurance, vehicle_inspection_log';
comment on column assets.reminders.target_id is '対象レコードID';
comment on column assets.reminders.reminder_type_code is 'リマインド種別コード';
comment on column assets.reminders.reminder_type_name is 'リマインド種別名';
comment on column assets.reminders.due_on is '期限日';
comment on column assets.reminders.alert_on is '通知日';
comment on column assets.reminders.completed_on is '完了日';

alter table assets.reminders
    drop constraint if exists fk_assets_reminders_created_by;
alter table assets.reminders
    add constraint fk_assets_reminders_created_by
    foreign key (created_by) references common.master_staffs(id);

alter table assets.reminders
    drop constraint if exists fk_assets_reminders_updated_by;
alter table assets.reminders
    add constraint fk_assets_reminders_updated_by
    foreign key (updated_by) references common.master_staffs(id);

alter table assets.reminders
    drop constraint if exists chk_assets_reminders_target_type;
alter table assets.reminders
    add constraint chk_assets_reminders_target_type
    check (
        target_type in (
            'permit',
            'permit_renewal_log',
            'vehicle',
            'vehicle_insurance',
            'vehicle_inspection_log'
        )
    );

create index if not exists idx_assets_reminders_target
    on assets.reminders (target_type, target_id);

create index if not exists idx_assets_reminders_due_on
    on assets.reminders (due_on);

create index if not exists idx_assets_reminders_alert_on
    on assets.reminders (alert_on);

drop trigger if exists trg_assets_reminders_updated_at
    on assets.reminders;
create trigger trg_assets_reminders_updated_at
before update on assets.reminders
for each row
execute function public.set_updated_at();


-- =========================================================
-- assets.event_logs
-- 汎用イベントログ
-- =========================================================
-- drop table if exists assets.event_logs cascade;

-- create table if not exists assets.event_logs (
--     id uuid primary key default gen_random_uuid(),

--     target_type text not null,
--     target_id uuid not null,

--     event_type_code text not null,
--     event_type_name text not null,
--     occurred_at timestamptz not null,

--     summary text null,
--     details jsonb not null default '{}'::jsonb,

--     created_at timestamptz not null default now(),
--     created_by uuid null
-- );

-- comment on table assets.event_logs is '汎用イベントログ';
-- comment on column assets.event_logs.target_type is '対象種別。例: permit, permit_renewal_log, vehicle, vehicle_insurance, vehicle_inspection_log';
-- comment on column assets.event_logs.target_id is '対象レコードID';
-- comment on column assets.event_logs.event_type_code is 'イベント種別コード';
-- comment on column assets.event_logs.event_type_name is 'イベント種別名';
-- comment on column assets.event_logs.occurred_at is '発生日時';
-- comment on column assets.event_logs.summary is '人が読みやすい要約';
-- comment on column assets.event_logs.details is 'イベント詳細(JSONB)';

-- alter table assets.event_logs
--     drop constraint if exists fk_assets_event_logs_created_by;
-- alter table assets.event_logs
--     add constraint fk_assets_event_logs_created_by
--     foreign key (created_by) references common.master_staffs(id);

-- alter table assets.event_logs
--     drop constraint if exists chk_assets_event_logs_target_type;
-- alter table assets.event_logs
--     add constraint chk_assets_event_logs_target_type
--     check (
--         target_type in (
--             'permit',
--             'permit_renewal_log',
--             'vehicle',
--             'vehicle_insurance',
--             'vehicle_inspection_log'
--         )
--     );

-- create index if not exists idx_assets_event_logs_target
--     on assets.event_logs (target_type, target_id);

-- create index if not exists idx_assets_event_logs_occurred_at
--     on assets.event_logs (occurred_at desc);

-- create index if not exists idx_assets_event_logs_event_type_code
--     on assets.event_logs (event_type_code);

-- create index if not exists idx_assets_event_logs_details_gin
--     on assets.event_logs using gin (details);


/*
=========================================================
assets.comments / assets.audit_logs
コメント・監査ログ用 migration SQL

【目的】
- reminders.memo を置き換える履歴テーブルとして comments を追加
- 投稿 / 更新 / 削除などの事実ログを audit_logs に記録する
- comments は物理削除とし、削除前本文は audit_logs.metadata に残す運用を前提とする

【設計方針】
- comments
  - 人が投稿する本文
  - permit / reminder に紐づけ可能
  - reminder 由来投稿（メールリンク経由など）も保持可能
  - updated_at は trigger で自動更新
  - 論理削除は持たず、削除時は物理削除

- audit_logs
  - システム操作の事実ログ
  - entity_type / entity_id / action_code / summary / metadata を保持
  - 削除時は metadata に削除前コメント本文のスナップショットを保存する想定

【補足】
- target_type / entity_type は polymorphic なので、
  target_id / entity_id の実体整合性はアプリ側で担保する
=========================================================
*/

begin;

-- =========================================================
-- comments
-- =========================================================
drop table if exists assets.comments cascade;
create table if not exists assets.comments (
  id uuid not null default gen_random_uuid(),

  target_type text not null,
  target_id uuid not null,

  -- comment_type_code text not null,
  body text not null,

  source_type text null,
  -- reminder_id uuid null,

  created_at timestamptz not null default now(),
  created_by uuid null,

  updated_at timestamptz not null default now(),
  updated_by uuid null,

  constraint comments_pkey
    primary key (id),

  constraint fk_assets_comments_created_by
    foreign key (created_by)
    references common.master_staffs(id),

  constraint fk_assets_comments_updated_by
    foreign key (updated_by)
    references common.master_staffs(id),

  -- constraint fk_assets_comments_reminder
  --   foreign key (reminder_id)
  --   references assets.reminders(id)
  --   on delete set null,

  constraint chk_assets_comments_target_type
    check (
      target_type = any (
        array[
          'permit'::text,
          'reminder'::text
        ]
      )
    ),

  -- constraint chk_assets_comments_comment_type_code
  --   check (
  --     comment_type_code = any (
  --       array[
  --         'memo'::text,
  --         'comment'::text,
  --         'reminder_response'::text
  --       ]
  --     )
  --   ),

  constraint chk_assets_comments_source_type
    check (
      source_type is null
      or source_type = any (
        array[
          'detail'::text,
          'email_link'::text,
          'manual'::text
        ]
      )
    )
) tablespace pg_default;

comment on table assets.comments is
'コメント / メモ / 対応記録テーブル。permit や reminder に紐づく人手投稿の本文を保持する。物理削除前提。';

comment on column assets.comments.target_type is
'コメント対象種別。permit / reminder を想定。';

comment on column assets.comments.target_id is
'コメント対象レコードID。target_type と組み合わせて解釈する。';

-- comment on column assets.comments.comment_type_code is
-- 'コメント種別。memo / comment / reminder_response を想定。';

comment on column assets.comments.body is
'コメント本文。';

comment on column assets.comments.source_type is
'投稿導線。detail / email_link / manual を想定。';

-- comment on column assets.comments.reminder_id is
-- '通知メール経由など、文脈となった reminder。target_type=reminder とは限らない。';

comment on column assets.comments.created_by is
'作成者 staff ID。selected_staff_id cookie から解決した current staff を想定。';

comment on column assets.comments.updated_by is
'更新者 staff ID。selected_staff_id cookie から解決した current staff を想定。';

create index if not exists idx_assets_comments_target
  on assets.comments using btree (target_type, target_id)
  tablespace pg_default;

create index if not exists idx_assets_comments_created_at
  on assets.comments using btree (created_at desc)
  tablespace pg_default;

-- create index if not exists idx_assets_comments_reminder_id
--   on assets.comments using btree (reminder_id)
--   tablespace pg_default;

create OR REPLACE trigger trg_assets_comments_updated_at
before update on assets.comments
for each row
execute function set_updated_at();

-- =========================================================
-- audit_logs
-- =========================================================
drop table if exists assets.audit_logs cascade;
create table if not exists assets.audit_logs (
  id uuid not null default gen_random_uuid(),

  entity_type text not null,
  entity_id uuid not null,

  action_code text not null,
  summary text null,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  created_by uuid null,

  constraint audit_logs_pkey
    primary key (id),

  constraint fk_assets_audit_logs_created_by
    foreign key (created_by)
    references common.master_staffs(id),

  constraint chk_assets_audit_logs_entity_type
    check (
      entity_type = any (
        array[
          'permit'::text,
          'reminder'::text,
          'comment'::text
        ]
      )
    )
) tablespace pg_default;

comment on table assets.audit_logs is
'監査ログ。投稿 / 更新 / 削除などの事実ログを保持する。';

comment on column assets.audit_logs.entity_type is
'対象エンティティ種別。permit / reminder / comment を想定。';

comment on column assets.audit_logs.entity_id is
'対象エンティティID。entity_type と組み合わせて解釈する。';

comment on column assets.audit_logs.action_code is
'操作種別。create / update / delete / complete などを想定。';

comment on column assets.audit_logs.summary is
'人間向け要約。例: コメントを登録、コメントを削除。';

comment on column assets.audit_logs.metadata is
'補助情報 JSON。削除時は削除前コメント本文スナップショットを保持する想定。';

comment on column assets.audit_logs.created_by is
'操作実行者 staff ID。selected_staff_id cookie から解決した current staff を想定。';

create index if not exists idx_assets_audit_logs_entity
  on assets.audit_logs using btree (entity_type, entity_id)
  tablespace pg_default;

create index if not exists idx_assets_audit_logs_created_at
  on assets.audit_logs using btree (created_at desc)
  tablespace pg_default;

create index if not exists idx_assets_audit_logs_action_code
  on assets.audit_logs using btree (action_code)
  tablespace pg_default;

create index if not exists idx_assets_audit_logs_metadata_gin
  on assets.audit_logs using gin (metadata)
  tablespace pg_default;

commit;
