-- =========================================================
-- 車両一覧 View
-- =========================================================
DROP view IF EXISTS assets.v_vehicles_list;
create or replace view assets.v_vehicles_list as
select
    v.id,
    v.registration_number,
    v.department_id,
    d.name as department_name,
    v.manufacturer_name,
    v.vehicle_name,
    v.vehicle_type,
    v.model_code,
    v.chassis_number,
    v.first_registered_on,
    v.status_code,
    v.status_name,
    v.note,
    v.sort_order,
    v.created_at,
    v.updated_at,
    (
        select count(*)
        from assets.attachment_links al
        where al.target_type = 'vehicle'
          and al.target_id = v.id
    ) as attachment_count
from assets.vehicles v
left join common.master_departments d
  on d.id = v.department_id;


-- =========================================================
-- 車両保険一覧 View
-- =========================================================
DROP view IF EXISTS assets.v_vehicle_insurances_list;
create or replace view assets.v_vehicle_insurances_list as
select
    vi.id,
    vi.vehicle_id,
    v.registration_number,
    v.department_id,
    d.name as department_name,
    v.manufacturer_name,
    v.vehicle_name,
    v.vehicle_type,
    vi.insurance_type_name,
    vi.insurer_name,
    vi.agency_name,
    vi.policy_number,
    vi.premium_amount,
    vi.coverage_summary,
    vi.starts_on,
    vi.expires_on,
    vi.status_code,
    vi.status_name,
    vi.note,
    vi.created_at,
    vi.updated_at,
    case
        when vi.expires_on is null then null
        else (vi.expires_on - current_date)
    end as days_until_expiry,
    case
        when vi.expires_on is null then false
        when vi.expires_on < current_date then true
        else false
    end as is_expired,
    (
        select count(*)
        from assets.attachment_links al
        where al.target_type = 'vehicle_insurance'
          and al.target_id = vi.id
    ) as attachment_count
from assets.vehicle_insurances vi
join assets.vehicles v
  on v.id = vi.vehicle_id
left join common.master_departments d
  on d.id = v.department_id;


-- =========================================================
-- 車両ごとの最新点検 View
-- =========================================================
DROP view IF EXISTS assets.v_vehicle_inspections_latest;
create or replace view assets.v_vehicle_inspections_latest as
select
    x.vehicle_id,
    x.id as vehicle_inspection_log_id,
    x.inspection_type_code,
    x.inspection_type_name,
    x.performed_on,
    x.next_due_on,
    x.contractor_name,
    x.odometer_km,
    x.fee_amount,
    x.result_code,
    x.result_name,
    x.findings,
    x.memo,
    x.created_at
from (
    select
        vil.*,
        row_number() over (
            partition by vil.vehicle_id
            order by vil.performed_on desc, vil.created_at desc, vil.id desc
        ) as rn
    from assets.vehicle_inspection_logs vil
) x
where x.rn = 1;


-- =========================================================
-- 車両一覧 + 最新保険 + 最新点検 View
-- =========================================================
DROP view IF EXISTS assets.v_vehicles_dashboard;
create or replace view assets.v_vehicles_dashboard as
select
    v.id,
    v.registration_number,
    v.department_id,
    d.name as department_name,
    v.manufacturer_name,
    v.vehicle_name,
    v.vehicle_type,
    v.status_code,
    v.status_name,
    vi.id as vehicle_insurance_id,
    vi.insurer_name,
    vi.agency_name,
    vi.policy_number,
    vi.expires_on as insurance_expires_on,
    case
        when vi.expires_on is null then null
        else (vi.expires_on - current_date)
    end as insurance_days_until_expiry,
    vil.vehicle_inspection_log_id,
    vil.inspection_type_name as latest_inspection_type_name,
    vil.performed_on as latest_inspection_on,
    vil.next_due_on as next_inspection_due_on
from assets.vehicles v
left join common.master_departments d
  on d.id = v.department_id
left join lateral (
    select i.*
    from assets.vehicle_insurances i
    where i.vehicle_id = v.id
    order by coalesce(i.expires_on, date '9999-12-31') desc, i.created_at desc, i.id desc
    limit 1
) vi on true
left join assets.v_vehicle_inspections_latest vil
  on vil.vehicle_id = v.id;
