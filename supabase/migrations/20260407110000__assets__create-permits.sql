
-- =========================================================
-- assets.permits
-- 許認可台帳本体
-- =========================================================
DROP TABLE IF EXISTS assets.permits CASCADE;
create table if not exists assets.permits (
    id uuid primary key default gen_random_uuid(),
    category_id uuid NOT NULL,
    subject_name text not null,
    business_name text null,
    permit_number text null,
    required_interval_label text null,
    issued_on date null,
    requires_prior_certificate boolean not null default false,
    note text null,
    created_at timestamptz not null default now(),
    created_by uuid null,
    updated_at timestamptz not null default now(),
    updated_by uuid null,
    deleted_at timestamptz null,
    deleted_by uuid null,
    delete_reason text null,

    -- 外部キー制約
    CONSTRAINT fk_permit_category
        FOREIGN KEY (category_id)
        REFERENCES assets.master_permit_categories(id)
        ON DELETE CASCADE
);

comment on table assets.permits is '許認可台帳本体';
comment on column assets.permits.category_id is '分類ID';
comment on column assets.permits.subject_name is '対象';
comment on column assets.permits.business_name is '業';
comment on column assets.permits.permit_number is '許可番号';
comment on column assets.permits.required_interval_label is '更新頻度。例: 7年おき';
comment on column assets.permits.issued_on is '許可日/発行日';
comment on column assets.permits.requires_prior_certificate is '先行許可証の提示が必要か';

alter table assets.permits
    drop constraint if exists fk_assets_permits_created_by;
alter table assets.permits
    add constraint fk_assets_permits_created_by
    foreign key (created_by) references common.master_staffs(id);

alter table assets.permits
    drop constraint if exists fk_assets_permits_updated_by;
alter table assets.permits
    add constraint fk_assets_permits_updated_by
    foreign key (updated_by) references common.master_staffs(id);

alter table assets.permits
    drop constraint if exists fk_assets_permits_deleted_by;
alter table assets.permits
    add constraint fk_assets_permits_deleted_by
    foreign key (deleted_by) references common.master_staffs(id);

create index if not exists idx_assets_permits_subject_name
    on assets.permits (subject_name);

drop trigger if exists trg_assets_permits_updated_at on assets.permits;
create trigger trg_assets_permits_updated_at
before update on assets.permits
for each row
execute function public.set_updated_at();

-- =========================================================
-- assets.permit_renewal_logs
-- 許認可更新履歴
-- =========================================================
DROP TABLE IF EXISTS assets.permit_renewal_logs CASCADE;
create table if not exists assets.permit_renewal_logs (
    id uuid primary key default gen_random_uuid(),
    permit_id uuid not null,
    reminder_id uuid not null,
    action_type_code text not null,
    action_type_name text not null,
    action_on date not null,
    previous_expires_on date null,
    new_expires_on date null,
    previous_permit_number text null,
    new_permit_number text null,
    fee_amount numeric(18,2) null,
    submitted_to text null,
    receipt_number text null,
    result_code text null,
    result_name text null,
    memo text null,
    created_at timestamptz not null default now(),
    created_by uuid null
);

comment on table assets.permit_renewal_logs is '許認可更新・再申請・変更届などの履歴';
comment on column assets.permit_renewal_logs.action_type_code is '処理種別コード。例: renewal, change_notice, reissue';
comment on column assets.permit_renewal_logs.action_on is '処理日';
comment on column assets.permit_renewal_logs.previous_expires_on is '変更前有効期限';
comment on column assets.permit_renewal_logs.new_expires_on is '変更後有効期限';
comment on column assets.permit_renewal_logs.receipt_number is '受付番号';
comment on column assets.permit_renewal_logs.result_code is '結果コード';
comment on column assets.permit_renewal_logs.result_name is '結果名';

alter table assets.permit_renewal_logs
    drop constraint if exists fk_assets_permit_renewal_logs_permit;
alter table assets.permit_renewal_logs
    add constraint fk_assets_permit_renewal_logs_permit
    foreign key (permit_id) references assets.permits(id);

alter table assets.permit_renewal_logs
    drop constraint if exists fk_assets_permit_renewal_logs_reminder;
alter table assets.permit_renewal_logs
    add constraint fk_assets_permit_renewal_logs_reminder
    foreign key (reminder_id) references assets.reminders (id) on delete set null;

alter table assets.permit_renewal_logs
    drop constraint if exists fk_assets_permit_renewal_logs_created_by;
alter table assets.permit_renewal_logs
    add constraint fk_assets_permit_renewal_logs_created_by
    foreign key (created_by) references common.master_staffs(id);

create index if not exists idx_assets_permit_renewal_logs_permit_id
    on assets.permit_renewal_logs (permit_id);

create index if not exists idx_assets_permit_renewal_logs_reminder_id
    on assets.permit_renewal_logs (reminder_id);

create index if not exists idx_assets_permit_renewal_logs_action_on
    on assets.permit_renewal_logs (action_on desc);

create index if not exists idx_assets_permit_renewal_logs_action_type_code
    on assets.permit_renewal_logs (action_type_code);
