create or replace function common.replace_staff_departments(
    p_staff_id uuid,
    p_department_ids uuid[]
)
returns void
language plpgsql
security definer
as $$
begin
    delete from common.staff_departments
        where staff_id = p_staff_id;

    insert into common.staff_departments (staff_id, department_id)
        select p_staff_id, unnest(p_department_ids)
        on conflict (staff_id, department_id) do nothing;
end;
$$;
