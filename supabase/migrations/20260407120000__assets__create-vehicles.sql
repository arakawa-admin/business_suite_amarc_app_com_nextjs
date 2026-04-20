create extension if not exists pgcrypto;

create schema if not exists assets;

-- =========================================================
-- assets.master_vehicle_insurance_categories
-- 保険カテゴリマスタ
-- =========================================================
DROP TABLE IF EXISTS assets.master_vehicle_insurance_categories CASCADE;
create table if not exists assets.master_vehicle_insurance_categories (
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

comment on table assets.master_vehicle_insurance_categories is '車両保険カテゴリマスタ';
comment on column assets.master_vehicle_insurance_categories.id is 'ID';
comment on column assets.master_vehicle_insurance_categories.code is '分類コード';
comment on column assets.master_vehicle_insurance_categories.name is '分類名';
comment on column assets.master_vehicle_insurance_categories.sort_order is '表示順';
comment on column assets.master_vehicle_insurance_categories.remarks is '備考';
comment on column assets.master_vehicle_insurance_categories.update_note is '更新時対応メモ';
comment on column assets.master_vehicle_insurance_categories.accident_internal_note is '事故時 社内対応メモ';
comment on column assets.master_vehicle_insurance_categories.accident_external_note is '事故時 社外対応メモ';
comment on column assets.master_vehicle_insurance_categories.valid_at is '適用開始日時';
comment on column assets.master_vehicle_insurance_categories.invalid_at is '適用終了日時';
comment on column assets.master_vehicle_insurance_categories.created_at is '作成日時';
comment on column assets.master_vehicle_insurance_categories.updated_at is '更新日時';
comment on column assets.master_vehicle_insurance_categories.created_by is '作成者 staff id';
comment on column assets.master_vehicle_insurance_categories.updated_by is '更新者 staff id';

create unique index if not exists uq_vehicle_insurance_categories_code
    on assets.master_vehicle_insurance_categories (code);

create index if not exists idx_vehicle_insurance_categories_sort_order
    on assets.master_vehicle_insurance_categories (sort_order);

create index if not exists idx_vehicle_insurance_categories_valid_at
    on assets.master_vehicle_insurance_categories (valid_at, invalid_at);

-- =========================================================
-- assets.master_vehicle_insurance_agencies
-- 保険契約先マスタ
-- =========================================================
DROP TABLE IF EXISTS assets.master_vehicle_insurance_agencies CASCADE;
create table if not exists assets.master_vehicle_insurance_agencies (
    id uuid primary key default gen_random_uuid(),
    insurance_category_id uuid not null references assets.master_vehicle_insurance_categories(id),
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

comment on table assets.master_vehicle_insurance_agencies is '車両保険契約先マスタ';
comment on column assets.master_vehicle_insurance_agencies.id is 'ID';
comment on column assets.master_vehicle_insurance_agencies.insurance_category_id is '保険カテゴリID';
comment on column assets.master_vehicle_insurance_agencies.insurance_company_name is '保険会社名';
comment on column assets.master_vehicle_insurance_agencies.agency_name is '代理店名';
comment on column assets.master_vehicle_insurance_agencies.contact_person_name is '担当者名';
comment on column assets.master_vehicle_insurance_agencies.mobile_phone is '携帯電話';
comment on column assets.master_vehicle_insurance_agencies.tel is '電話番号';
comment on column assets.master_vehicle_insurance_agencies.fax is 'FAX番号';
comment on column assets.master_vehicle_insurance_agencies.remarks is '備考';
comment on column assets.master_vehicle_insurance_agencies.valid_at is '適用開始日時';
comment on column assets.master_vehicle_insurance_agencies.invalid_at is '適用終了日時';
comment on column assets.master_vehicle_insurance_agencies.created_at is '作成日時';
comment on column assets.master_vehicle_insurance_agencies.updated_at is '更新日時';
comment on column assets.master_vehicle_insurance_agencies.created_by is '作成者 staff id';
comment on column assets.master_vehicle_insurance_agencies.updated_by is '更新者 staff id';

create index if not exists idx_vehicle_insurance_agencies_category_id
    on assets.master_vehicle_insurance_agencies (insurance_category_id);

create index if not exists idx_vehicle_insurance_agencies_company_name
    on assets.master_vehicle_insurance_agencies (insurance_company_name);

create index if not exists idx_vehicle_insurance_agencies_agency_name
    on assets.master_vehicle_insurance_agencies (agency_name);

create index if not exists idx_vehicle_insurance_agencies_valid_at
    on assets.master_vehicle_insurance_agencies (valid_at, invalid_at);

-- 必要に応じて重複をある程度抑えるための一意制約
create unique index if not exists uq_vehicle_insurance_agencies_category_company_agency
    on assets.master_vehicle_insurance_agencies (
        insurance_category_id,
        insurance_company_name,
        coalesce(agency_name, '')
    );

-- =========================================================
-- assets.vehicles
-- 車両台帳
-- ※ 車検満了日は reminders で管理する
-- =========================================================
DROP TABLE IF EXISTS assets.vehicles CASCADE;
create table if not exists assets.vehicles (
    id uuid primary key default gen_random_uuid(),
    registration_number text not null,
    department_id uuid null references common.master_departments(id),
    manufacturer_name text null,
    vehicle_name text null,
    type_name text null,
    model text null,
    serial_number text null,
    first_registered_ym text null
        check (first_registered_ym ~ '^\d{4}-(0[1-9]|1[0-2])$'),
    owner_name text null,
    is_fixed_asset boolean not null default false,
    is_registered boolean not null default true,
    voluntary_insurance_agency_id uuid null references assets.master_vehicle_insurance_agencies(id),
    compulsory_insurance_agency_name text null,
    note text null,
    valid_at timestamptz not null default now(),
    invalid_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid null references common.master_staffs(id),
    updated_by uuid null references common.master_staffs(id),
    deleted_at timestamptz null,
    deleted_by uuid null references common.master_staffs(id),
    delete_reason text null
);

comment on table assets.vehicles is '車両台帳';
comment on column assets.vehicles.id is 'ID';
comment on column assets.vehicles.registration_number is '公的なナンバー / 登録番号';
comment on column assets.vehicles.department_id is '使用部門ID';
comment on column assets.vehicles.manufacturer_name is 'メーカー名';
comment on column assets.vehicles.vehicle_name is '車名';
comment on column assets.vehicles.type_name is 'タイプ';
comment on column assets.vehicles.model is '型式';
comment on column assets.vehicles.serial_number is '車台番号又は製造番号';
comment on column assets.vehicles.first_registered_ym is '初年度登録年月。YYYY-MM形式で保持';
comment on column assets.vehicles.owner_name is '所有者';
comment on column assets.vehicles.is_fixed_asset is '固定資産計上の有無';
comment on column assets.vehicles.is_registered is '番号登録の有無';
comment on column assets.vehicles.voluntary_insurance_agency_id is '任意保険契約先ID';
comment on column assets.vehicles.compulsory_insurance_agency_name is '自賠責代理店名';
comment on column assets.vehicles.note is '備考';
comment on column assets.vehicles.valid_at is '適用開始日時';
comment on column assets.vehicles.invalid_at is '適用終了日時';
comment on column assets.vehicles.created_at is '作成日時';
comment on column assets.vehicles.updated_at is '更新日時';
comment on column assets.vehicles.created_by is '作成者 staff id';
comment on column assets.vehicles.updated_by is '更新者 staff id';
comment on column assets.vehicles.deleted_at is '削除日時（論理削除）';
comment on column assets.vehicles.deleted_by is '削除者 staff id';
comment on column assets.vehicles.delete_reason is '削除理由';

-- 論理削除を考慮した現役レコードのみ一意
create unique index if not exists uq_vehicles_registration_number_active
    on assets.vehicles (registration_number)
    where deleted_at is null;

create index if not exists idx_vehicles_manufacturer_name
    on assets.vehicles (manufacturer_name);

create index if not exists idx_vehicles_vehicle_name
    on assets.vehicles (vehicle_name);

create index if not exists idx_vehicles_type_name
    on assets.vehicles (type_name);

create index if not exists idx_vehicles_model
    on assets.vehicles (model);

create index if not exists idx_vehicles_serial_number
    on assets.vehicles (serial_number);

create index if not exists idx_vehicles_first_registered_ym
    on assets.vehicles (first_registered_ym);

create index if not exists idx_vehicles_voluntary_insurance_agency_id
    on assets.vehicles (voluntary_insurance_agency_id);

create index if not exists idx_vehicles_valid_at
    on assets.vehicles (valid_at, invalid_at);

create index if not exists idx_vehicles_deleted_at
    on assets.vehicles (deleted_at);

-- updated_at 自動更新用
create or replace function assets.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists trg_vehicle_insurance_categories_set_updated_at
    on assets.master_vehicle_insurance_categories;
create trigger trg_vehicle_insurance_categories_set_updated_at
before update on assets.master_vehicle_insurance_categories
for each row
execute function assets.set_updated_at();

drop trigger if exists trg_vehicle_insurance_agencies_set_updated_at
    on assets.master_vehicle_insurance_agencies;
create trigger trg_vehicle_insurance_agencies_set_updated_at
before update on assets.master_vehicle_insurance_agencies
for each row
execute function assets.set_updated_at();

drop trigger if exists trg_vehicles_set_updated_at
    on assets.vehicles;
create trigger trg_vehicles_set_updated_at
before update on assets.vehicles
for each row
execute function assets.set_updated_at();
