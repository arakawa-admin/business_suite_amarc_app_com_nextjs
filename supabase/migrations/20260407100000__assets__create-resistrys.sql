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

    memo text null,

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
drop table if exists assets.event_logs cascade;

create table if not exists assets.event_logs (
    id uuid primary key default gen_random_uuid(),

    target_type text not null,
    target_id uuid not null,

    event_type_code text not null,
    event_type_name text not null,
    occurred_at timestamptz not null,

    summary text null,
    details jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    created_by uuid null
);

comment on table assets.event_logs is '汎用イベントログ';
comment on column assets.event_logs.target_type is '対象種別。例: permit, permit_renewal_log, vehicle, vehicle_insurance, vehicle_inspection_log';
comment on column assets.event_logs.target_id is '対象レコードID';
comment on column assets.event_logs.event_type_code is 'イベント種別コード';
comment on column assets.event_logs.event_type_name is 'イベント種別名';
comment on column assets.event_logs.occurred_at is '発生日時';
comment on column assets.event_logs.summary is '人が読みやすい要約';
comment on column assets.event_logs.details is 'イベント詳細(JSONB)';

alter table assets.event_logs
    drop constraint if exists fk_assets_event_logs_created_by;
alter table assets.event_logs
    add constraint fk_assets_event_logs_created_by
    foreign key (created_by) references common.master_staffs(id);

alter table assets.event_logs
    drop constraint if exists chk_assets_event_logs_target_type;
alter table assets.event_logs
    add constraint chk_assets_event_logs_target_type
    check (
        target_type in (
            'permit',
            'permit_renewal_log',
            'vehicle',
            'vehicle_insurance',
            'vehicle_inspection_log'
        )
    );

create index if not exists idx_assets_event_logs_target
    on assets.event_logs (target_type, target_id);

create index if not exists idx_assets_event_logs_occurred_at
    on assets.event_logs (occurred_at desc);

create index if not exists idx_assets_event_logs_event_type_code
    on assets.event_logs (event_type_code);

create index if not exists idx_assets_event_logs_details_gin
    on assets.event_logs using gin (details);
