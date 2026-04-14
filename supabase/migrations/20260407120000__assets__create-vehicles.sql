-- =========================================================
-- assets.vehicles
-- 車両台帳本体
-- =========================================================
DROP TABLE IF EXISTS assets.vehicles CASCADE;
create table if not exists assets.vehicles (
    id uuid primary key default gen_random_uuid(),
    registration_number text not null,
    department_id uuid null,
    manufacturer_name text null,
    vehicle_name text null,
    vehicle_type text null,
    model_code text null,
    chassis_number text null,
    first_registered_on date null,
    status_code text not null default 'active',
    status_name text not null default '使用中',
    note text null,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    created_by uuid null,
    updated_at timestamptz not null default now(),
    updated_by uuid null
);

comment on table assets.vehicles is '車両台帳本体';
comment on column assets.vehicles.registration_number is '登録番号';
comment on column assets.vehicles.department_id is '使用事業部';
comment on column assets.vehicles.manufacturer_name is 'メーカー名';
comment on column assets.vehicles.vehicle_name is '車名';
comment on column assets.vehicles.vehicle_type is 'タイプ';
comment on column assets.vehicles.model_code is '型式等';
comment on column assets.vehicles.chassis_number is '車台番号';
comment on column assets.vehicles.first_registered_on is '初度登録日';

alter table assets.vehicles
    drop constraint if exists uq_assets_vehicles_registration_number;
alter table assets.vehicles
    add constraint uq_assets_vehicles_registration_number
    unique (registration_number);

alter table assets.vehicles
    drop constraint if exists fk_assets_vehicles_department;
alter table assets.vehicles
    add constraint fk_assets_vehicles_department
    foreign key (department_id) references common.master_departments(id);

alter table assets.vehicles
    drop constraint if exists fk_assets_vehicles_created_by;
alter table assets.vehicles
    add constraint fk_assets_vehicles_created_by
    foreign key (created_by) references common.master_staffs(id);

alter table assets.vehicles
    drop constraint if exists fk_assets_vehicles_updated_by;
alter table assets.vehicles
    add constraint fk_assets_vehicles_updated_by
    foreign key (updated_by) references common.master_staffs(id);

create index if not exists idx_assets_vehicles_department_id
    on assets.vehicles (department_id);

create index if not exists idx_assets_vehicles_status_code
    on assets.vehicles (status_code);

drop trigger if exists trg_assets_vehicles_updated_at on assets.vehicles;
create trigger trg_assets_vehicles_updated_at
before update on assets.vehicles
for each row
execute function public.set_updated_at();

-- =========================================================
-- assets.vehicle_insurances
-- 車両保険契約本体
-- =========================================================
DROP TABLE IF EXISTS assets.vehicle_insurances CASCADE;
create table if not exists assets.vehicle_insurances (
    id uuid primary key default gen_random_uuid(),
    vehicle_id uuid not null,
    insurance_type_name text not null default '自動車保険',
    insurer_name text null,
    agency_name text null,
    policy_number text null,
    premium_amount numeric(18,2) null,
    coverage_summary text null,
    starts_on date null,
    expires_on date null,
    status_code text not null default 'active',
    status_name text not null default '有効',
    note text null,
    created_at timestamptz not null default now(),
    created_by uuid null,
    updated_at timestamptz not null default now(),
    updated_by uuid null
);

comment on table assets.vehicle_insurances is '車両ごとの保険契約';
comment on column assets.vehicle_insurances.vehicle_id is '対象車両ID';
comment on column assets.vehicle_insurances.insurance_type_name is '保険種別名';
comment on column assets.vehicle_insurances.insurer_name is '保険会社名';
comment on column assets.vehicle_insurances.agency_name is '代理店名';
comment on column assets.vehicle_insurances.policy_number is '証券番号';
comment on column assets.vehicle_insurances.premium_amount is '保険料';
comment on column assets.vehicle_insurances.coverage_summary is '補償内容要約';
comment on column assets.vehicle_insurances.starts_on is '契約開始日';
comment on column assets.vehicle_insurances.expires_on is '満期日';

alter table assets.vehicle_insurances
    drop constraint if exists fk_assets_vehicle_insurances_vehicle;
alter table assets.vehicle_insurances
    add constraint fk_assets_vehicle_insurances_vehicle
    foreign key (vehicle_id) references assets.vehicles(id) on delete cascade;

alter table assets.vehicle_insurances
    drop constraint if exists fk_assets_vehicle_insurances_created_by;
alter table assets.vehicle_insurances
    add constraint fk_assets_vehicle_insurances_created_by
    foreign key (created_by) references common.master_staffs(id);

alter table assets.vehicle_insurances
    drop constraint if exists fk_assets_vehicle_insurances_updated_by;
alter table assets.vehicle_insurances
    add constraint fk_assets_vehicle_insurances_updated_by
    foreign key (updated_by) references common.master_staffs(id);

create index if not exists idx_assets_vehicle_insurances_vehicle_id
    on assets.vehicle_insurances (vehicle_id);

create index if not exists idx_assets_vehicle_insurances_expires_on
    on assets.vehicle_insurances (expires_on);

create index if not exists idx_assets_vehicle_insurances_status_code
    on assets.vehicle_insurances (status_code);

drop trigger if exists trg_assets_vehicle_insurances_updated_at on assets.vehicle_insurances;
create trigger trg_assets_vehicle_insurances_updated_at
before update on assets.vehicle_insurances
for each row
execute function public.set_updated_at();

-- =========================================================
-- assets.vehicle_insurance_logs
-- 保険契約変更履歴
-- =========================================================
DROP TABLE IF EXISTS assets.vehicle_insurance_logs CASCADE;
create table if not exists assets.vehicle_insurance_logs (
    id uuid primary key default gen_random_uuid(),
    vehicle_insurance_id uuid not null,
    action_type_code text not null,
    action_type_name text not null,
    action_on date not null,
    previous_expires_on date null,
    new_expires_on date null,
    previous_premium_amount numeric(18,2) null,
    new_premium_amount numeric(18,2) null,
    previous_agency_name text null,
    new_agency_name text null,
    previous_policy_number text null,
    new_policy_number text null,
    result_code text null,
    result_name text null,
    memo text null,
    created_at timestamptz not null default now(),
    created_by uuid null
);

comment on table assets.vehicle_insurance_logs is '車両保険契約の更新・解約・変更履歴';
comment on column assets.vehicle_insurance_logs.action_type_code is '処理種別コード。例: start, renew, cancel, agency_change';
comment on column assets.vehicle_insurance_logs.action_on is '処理日';

alter table assets.vehicle_insurance_logs
    drop constraint if exists fk_assets_vehicle_insurance_logs_vehicle_insurance;
alter table assets.vehicle_insurance_logs
    add constraint fk_assets_vehicle_insurance_logs_vehicle_insurance
    foreign key (vehicle_insurance_id) references assets.vehicle_insurances(id) on delete cascade;

alter table assets.vehicle_insurance_logs
    drop constraint if exists fk_assets_vehicle_insurance_logs_created_by;
alter table assets.vehicle_insurance_logs
    add constraint fk_assets_vehicle_insurance_logs_created_by
    foreign key (created_by) references common.master_staffs(id);

create index if not exists idx_assets_vehicle_insurance_logs_vehicle_insurance_id
    on assets.vehicle_insurance_logs (vehicle_insurance_id);

create index if not exists idx_assets_vehicle_insurance_logs_action_on
    on assets.vehicle_insurance_logs (action_on desc);

create index if not exists idx_assets_vehicle_insurance_logs_action_type_code
    on assets.vehicle_insurance_logs (action_type_code);

-- =========================================================
-- assets.vehicle_inspection_logs
-- 車検・点検・整備履歴
-- =========================================================
DROP TABLE IF EXISTS assets.vehicle_inspection_logs CASCADE;
create table if not exists assets.vehicle_inspection_logs (
    id uuid primary key default gen_random_uuid(),
    vehicle_id uuid not null,
    inspection_type_code text not null,
    inspection_type_name text not null,
    performed_on date not null,
    next_due_on date null,
    contractor_name text null,
    odometer_km integer null,
    fee_amount numeric(18,2) null,
    result_code text null,
    result_name text null,
    findings text null,
    memo text null,
    created_at timestamptz not null default now(),
    created_by uuid null,
    constraint chk_assets_vehicle_inspection_logs_odometer_km
        check (odometer_km is null or odometer_km >= 0)
);

comment on table assets.vehicle_inspection_logs is '車検・点検・整備履歴';
comment on column assets.vehicle_inspection_logs.inspection_type_code is '種別コード。例: shaken, periodic_3m, periodic_6m, periodic_12m, maintenance, repair';
comment on column assets.vehicle_inspection_logs.performed_on is '実施日';
comment on column assets.vehicle_inspection_logs.next_due_on is '次回予定日';
comment on column assets.vehicle_inspection_logs.contractor_name is '実施業者名';
comment on column assets.vehicle_inspection_logs.odometer_km is '走行距離(km)';
comment on column assets.vehicle_inspection_logs.fee_amount is '費用';
comment on column assets.vehicle_inspection_logs.findings is '指摘事項';

alter table assets.vehicle_inspection_logs
    drop constraint if exists fk_assets_vehicle_inspection_logs_vehicle;
alter table assets.vehicle_inspection_logs
    add constraint fk_assets_vehicle_inspection_logs_vehicle
    foreign key (vehicle_id) references assets.vehicles(id) on delete cascade;

alter table assets.vehicle_inspection_logs
    drop constraint if exists fk_assets_vehicle_inspection_logs_created_by;
alter table assets.vehicle_inspection_logs
    add constraint fk_assets_vehicle_inspection_logs_created_by
    foreign key (created_by) references common.master_staffs(id);

create index if not exists idx_assets_vehicle_inspection_logs_vehicle_id
    on assets.vehicle_inspection_logs (vehicle_id);

create index if not exists idx_assets_vehicle_inspection_logs_performed_on
    on assets.vehicle_inspection_logs (performed_on desc);

create index if not exists idx_assets_vehicle_inspection_logs_next_due_on
    on assets.vehicle_inspection_logs (next_due_on);

create index if not exists idx_assets_vehicle_inspection_logs_inspection_type_code
    on assets.vehicle_inspection_logs (inspection_type_code);
