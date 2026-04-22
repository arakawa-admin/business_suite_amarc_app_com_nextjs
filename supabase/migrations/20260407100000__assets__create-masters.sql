create extension if not exists pgcrypto;

create schema if not exists assets;

-- =========================================================
-- assets.master_insurance_categories
-- 保険カテゴリマスタ
-- =========================================================
DROP TABLE IF EXISTS assets.master_insurance_categories CASCADE;
create table if not exists assets.master_insurance_categories (
    id uuid primary key default gen_random_uuid(),
    code text not null,
    name text not null,
    sort_order integer not null default 100,
    remarks text null,
    update_note text null,
    accident_internal_note text null,
    accident_external_note text null,
    valid_at timestamptz not null default now(),
    invalid_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid null references common.master_staffs(id),
    updated_by uuid null references common.master_staffs(id)
);

comment on table assets.master_insurance_categories is '保険カテゴリマスタ';
comment on column assets.master_insurance_categories.id is 'ID';
comment on column assets.master_insurance_categories.code is '分類コード';
comment on column assets.master_insurance_categories.name is '分類名';
comment on column assets.master_insurance_categories.sort_order is '表示順';
comment on column assets.master_insurance_categories.remarks is '備考';
comment on column assets.master_insurance_categories.update_note is '更新時対応メモ';
comment on column assets.master_insurance_categories.accident_internal_note is '事故時 社内対応メモ';
comment on column assets.master_insurance_categories.accident_external_note is '事故時 社外対応メモ';
comment on column assets.master_insurance_categories.valid_at is '適用開始日時';
comment on column assets.master_insurance_categories.invalid_at is '適用終了日時';
comment on column assets.master_insurance_categories.created_at is '作成日時';
comment on column assets.master_insurance_categories.updated_at is '更新日時';
comment on column assets.master_insurance_categories.created_by is '作成者 staff id';
comment on column assets.master_insurance_categories.updated_by is '更新者 staff id';

create unique index if not exists uq_insurance_categories_code
    on assets.master_insurance_categories (code);

create index if not exists idx_insurance_categories_sort_order
    on assets.master_insurance_categories (sort_order);

create index if not exists idx_insurance_categories_valid_at
    on assets.master_insurance_categories (valid_at, invalid_at);

-- =========================================================
-- assets.master_insurance_agencies
-- 保険契約先マスタ
-- =========================================================
DROP TABLE IF EXISTS assets.master_insurance_agencies CASCADE;
create table if not exists assets.master_insurance_agencies (
    id uuid primary key default gen_random_uuid(),
    insurance_category_id uuid not null references assets.master_insurance_categories(id),
    insurance_company_name text not null,
    agency_name text null,
    contact_person_name text null,
    mobile_phone text null,
    tel text null,
    fax text null,
    remarks text null,
    valid_at timestamptz not null default now(),
    invalid_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid null references common.master_staffs(id),
    updated_by uuid null references common.master_staffs(id)
);

comment on table assets.master_insurance_agencies is '保険契約先マスタ';
comment on column assets.master_insurance_agencies.id is 'ID';
comment on column assets.master_insurance_agencies.insurance_category_id is '保険カテゴリID';
comment on column assets.master_insurance_agencies.insurance_company_name is '保険会社名';
comment on column assets.master_insurance_agencies.agency_name is '代理店名';
comment on column assets.master_insurance_agencies.contact_person_name is '担当者名';
comment on column assets.master_insurance_agencies.mobile_phone is '携帯電話';
comment on column assets.master_insurance_agencies.tel is '電話番号';
comment on column assets.master_insurance_agencies.fax is 'FAX番号';
comment on column assets.master_insurance_agencies.remarks is '備考';
comment on column assets.master_insurance_agencies.valid_at is '適用開始日時';
comment on column assets.master_insurance_agencies.invalid_at is '適用終了日時';
comment on column assets.master_insurance_agencies.created_at is '作成日時';
comment on column assets.master_insurance_agencies.updated_at is '更新日時';
comment on column assets.master_insurance_agencies.created_by is '作成者 staff id';
comment on column assets.master_insurance_agencies.updated_by is '更新者 staff id';

create index if not exists idx_insurance_agencies_category_id
    on assets.master_insurance_agencies (insurance_category_id);

create index if not exists idx_insurance_agencies_company_name
    on assets.master_insurance_agencies (insurance_company_name);

create index if not exists idx_insurance_agencies_agency_name
    on assets.master_insurance_agencies (agency_name);

create index if not exists idx_insurance_agencies_valid_at
    on assets.master_insurance_agencies (valid_at, invalid_at);

-- 必要に応じて重複をある程度抑えるための一意制約
create unique index if not exists uq_insurance_agencies_category_company_agency
    on assets.master_insurance_agencies (
        insurance_category_id,
        insurance_company_name,
        coalesce(agency_name, '')
    );
