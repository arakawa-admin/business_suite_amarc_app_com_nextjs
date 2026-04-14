-- =========================================================
-- schema grants
-- =========================================================
grant usage on schema assets to authenticated;
grant usage on schema assets to anon;

grant select, insert, update, delete on all tables in schema assets to authenticated;
grant select on all tables in schema assets to anon;

grant usage, select on all sequences in schema assets to authenticated;
grant usage, select on all sequences in schema assets to anon;

alter default privileges in schema assets
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema assets
grant select on tables to anon;

alter default privileges in schema assets
grant usage, select on sequences to authenticated;

alter default privileges in schema assets
grant usage, select on sequences to anon;

-- =========================================================
-- RLS enable
-- =========================================================
alter table assets.master_permit_categories enable row level security;
alter table assets.attachments enable row level security;
alter table assets.attachment_links enable row level security;
alter table assets.reminders enable row level security;
alter table assets.event_logs enable row level security;
alter table assets.permits enable row level security;
alter table assets.permit_renewal_logs enable row level security;
alter table assets.vehicles enable row level security;
alter table assets.vehicle_insurances enable row level security;
alter table assets.vehicle_insurance_logs enable row level security;
alter table assets.vehicle_inspection_logs enable row level security;

-- =========================================================
-- drop old policies
-- =========================================================
drop policy if exists "attachments_select_authenticated" on assets.attachments;
drop policy if exists "attachments_insert_authenticated" on assets.attachments;
drop policy if exists "attachments_update_authenticated" on assets.attachments;
drop policy if exists "attachments_delete_authenticated" on assets.attachments;

drop policy if exists "attachment_links_select_authenticated" on assets.attachment_links;
drop policy if exists "attachment_links_insert_authenticated" on assets.attachment_links;
drop policy if exists "attachment_links_update_authenticated" on assets.attachment_links;
drop policy if exists "attachment_links_delete_authenticated" on assets.attachment_links;

drop policy if exists "reminders_select_authenticated" on assets.reminders;
drop policy if exists "reminders_insert_authenticated" on assets.reminders;
drop policy if exists "reminders_update_authenticated" on assets.reminders;
drop policy if exists "reminders_delete_authenticated" on assets.reminders;

drop policy if exists "event_logs_select_authenticated" on assets.event_logs;
drop policy if exists "event_logs_insert_authenticated" on assets.event_logs;
drop policy if exists "event_logs_update_authenticated" on assets.event_logs;
drop policy if exists "event_logs_delete_authenticated" on assets.event_logs;

drop policy if exists "master_permit_categories_select_authenticated" on assets.master_permit_categories;
drop policy if exists "master_permit_categories_insert_authenticated" on assets.master_permit_categories;
drop policy if exists "master_permit_categories_update_authenticated" on assets.master_permit_categories;
drop policy if exists "master_permit_categoriess_delete_authenticated" on assets.master_permit_categories;

drop policy if exists "permits_select_authenticated" on assets.permits;
drop policy if exists "permits_insert_authenticated" on assets.permits;
drop policy if exists "permits_update_authenticated" on assets.permits;
drop policy if exists "permits_delete_authenticated" on assets.permits;

drop policy if exists "permit_renewal_logs_select_authenticated" on assets.permit_renewal_logs;
drop policy if exists "permit_renewal_logs_insert_authenticated" on assets.permit_renewal_logs;
drop policy if exists "permit_renewal_logs_update_authenticated" on assets.permit_renewal_logs;
drop policy if exists "permit_renewal_logs_delete_authenticated" on assets.permit_renewal_logs;

drop policy if exists "vehicles_select_authenticated" on assets.vehicles;
drop policy if exists "vehicles_insert_authenticated" on assets.vehicles;
drop policy if exists "vehicles_update_authenticated" on assets.vehicles;
drop policy if exists "vehicles_delete_authenticated" on assets.vehicles;

drop policy if exists "vehicle_insurances_select_authenticated" on assets.vehicle_insurances;
drop policy if exists "vehicle_insurances_insert_authenticated" on assets.vehicle_insurances;
drop policy if exists "vehicle_insurances_update_authenticated" on assets.vehicle_insurances;
drop policy if exists "vehicle_insurances_delete_authenticated" on assets.vehicle_insurances;

drop policy if exists "vehicle_insurance_logs_select_authenticated" on assets.vehicle_insurance_logs;
drop policy if exists "vehicle_insurance_logs_insert_authenticated" on assets.vehicle_insurance_logs;
drop policy if exists "vehicle_insurance_logs_update_authenticated" on assets.vehicle_insurance_logs;
drop policy if exists "vehicle_insurance_logs_delete_authenticated" on assets.vehicle_insurance_logs;

drop policy if exists "vehicle_inspection_logs_select_authenticated" on assets.vehicle_inspection_logs;
drop policy if exists "vehicle_inspection_logs_insert_authenticated" on assets.vehicle_inspection_logs;
drop policy if exists "vehicle_inspection_logs_update_authenticated" on assets.vehicle_inspection_logs;
drop policy if exists "vehicle_inspection_logs_delete_authenticated" on assets.vehicle_inspection_logs;

-- =========================================================
-- attachments
-- =========================================================
create policy "attachments_select_authenticated"
on assets.attachments
for select
to authenticated
using (true);

create policy "attachments_insert_authenticated"
on assets.attachments
for insert
to authenticated
with check (true);

create policy "attachments_update_authenticated"
on assets.attachments
for update
to authenticated
using (true)
with check (true);

create policy "attachments_delete_authenticated"
on assets.attachments
for delete
to authenticated
using (true);

-- =========================================================
-- attachment_links
-- =========================================================
create policy "attachment_links_select_authenticated"
on assets.attachment_links
for select
to authenticated
using (true);

create policy "attachment_links_insert_authenticated"
on assets.attachment_links
for insert
to authenticated
with check (true);

create policy "attachment_links_update_authenticated"
on assets.attachment_links
for update
to authenticated
using (true)
with check (true);

create policy "attachment_links_delete_authenticated"
on assets.attachment_links
for delete
to authenticated
using (true);

-- =========================================================
-- reminders
-- =========================================================
create policy "reminders_select_authenticated"
on assets.reminders
for select
to authenticated
using (true);

create policy "reminders_insert_authenticated"
on assets.reminders
for insert
to authenticated
with check (true);

create policy "reminders_update_authenticated"
on assets.reminders
for update
to authenticated
using (true)
with check (true);

create policy "reminders_delete_authenticated"
on assets.reminders
for delete
to authenticated
using (true);

-- =========================================================
-- event_logs
-- =========================================================
create policy "event_logs_select_authenticated"
on assets.event_logs
for select
to authenticated
using (true);

create policy "event_logs_insert_authenticated"
on assets.event_logs
for insert
to authenticated
with check (true);

create policy "event_logs_update_authenticated"
on assets.event_logs
for update
to authenticated
using (true)
with check (true);

create policy "event_logs_delete_authenticated"
on assets.event_logs
for delete
to authenticated
using (true);

-- =========================================================
-- master_permit_categories
-- =========================================================
create policy "master_permit_categories_select_authenticated"
on assets.master_permit_categories
for select
to authenticated
using (true);

create policy "master_permit_categories_insert_authenticated"
on assets.master_permit_categories
for insert
to authenticated
with check (true);

create policy "master_permit_categories_update_authenticated"
on assets.master_permit_categories
for update
to authenticated
using (true)
with check (true);

create policy "master_permit_categoriess_delete_authenticated"
on assets.master_permit_categories
for delete
to authenticated
using (true);

-- =========================================================
-- permits
-- =========================================================
create policy "permits_select_authenticated"
on assets.permits
for select
to authenticated
using (true);

create policy "permits_insert_authenticated"
on assets.permits
for insert
to authenticated
with check (true);

create policy "permits_update_authenticated"
on assets.permits
for update
to authenticated
using (true)
with check (true);

create policy "permits_delete_authenticated"
on assets.permits
for delete
to authenticated
using (true);

-- =========================================================
-- permit_renewal_logs
-- =========================================================
create policy "permit_renewal_logs_select_authenticated"
on assets.permit_renewal_logs
for select
to authenticated
using (true);

create policy "permit_renewal_logs_insert_authenticated"
on assets.permit_renewal_logs
for insert
to authenticated
with check (true);

create policy "permit_renewal_logs_update_authenticated"
on assets.permit_renewal_logs
for update
to authenticated
using (true)
with check (true);

create policy "permit_renewal_logs_delete_authenticated"
on assets.permit_renewal_logs
for delete
to authenticated
using (true);

-- =========================================================
-- vehicles
-- =========================================================
create policy "vehicles_select_authenticated"
on assets.vehicles
for select
to authenticated
using (true);

create policy "vehicles_insert_authenticated"
on assets.vehicles
for insert
to authenticated
with check (true);

create policy "vehicles_update_authenticated"
on assets.vehicles
for update
to authenticated
using (true)
with check (true);

create policy "vehicles_delete_authenticated"
on assets.vehicles
for delete
to authenticated
using (true);

-- =========================================================
-- vehicle_insurances
-- =========================================================
create policy "vehicle_insurances_select_authenticated"
on assets.vehicle_insurances
for select
to authenticated
using (true);

create policy "vehicle_insurances_insert_authenticated"
on assets.vehicle_insurances
for insert
to authenticated
with check (true);

create policy "vehicle_insurances_update_authenticated"
on assets.vehicle_insurances
for update
to authenticated
using (true)
with check (true);

create policy "vehicle_insurances_delete_authenticated"
on assets.vehicle_insurances
for delete
to authenticated
using (true);

-- =========================================================
-- vehicle_insurance_logs
-- =========================================================
create policy "vehicle_insurance_logs_select_authenticated"
on assets.vehicle_insurance_logs
for select
to authenticated
using (true);

create policy "vehicle_insurance_logs_insert_authenticated"
on assets.vehicle_insurance_logs
for insert
to authenticated
with check (true);

create policy "vehicle_insurance_logs_update_authenticated"
on assets.vehicle_insurance_logs
for update
to authenticated
using (true)
with check (true);

create policy "vehicle_insurance_logs_delete_authenticated"
on assets.vehicle_insurance_logs
for delete
to authenticated
using (true);

-- =========================================================
-- vehicle_inspection_logs
-- =========================================================
create policy "vehicle_inspection_logs_select_authenticated"
on assets.vehicle_inspection_logs
for select
to authenticated
using (true);

create policy "vehicle_inspection_logs_insert_authenticated"
on assets.vehicle_inspection_logs
for insert
to authenticated
with check (true);

create policy "vehicle_inspection_logs_update_authenticated"
on assets.vehicle_inspection_logs
for update
to authenticated
using (true)
with check (true);

create policy "vehicle_inspection_logs_delete_authenticated"
on assets.vehicle_inspection_logs
for delete
to authenticated
using (true);
