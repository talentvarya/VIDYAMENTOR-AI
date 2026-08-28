-- Resolve PL/pgSQL enum typing warnings and keep manual entitlements server-only.

create or replace function public.admin_set_student_status(
  p_student_user_id uuid,
  p_status public.student_status,
  p_reason text default null
)
returns public.student_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role public.app_role := private.current_role();
  caller_workspace public.admin_workspace := 'normal'::public.admin_workspace;
  existing public.student_profiles%rowtype;
  result public.student_profiles;
  selected_pool uuid;
  existing_assignment uuid;
  required_workspace public.admin_workspace := 'normal'::public.admin_workspace;
begin
  if not private.has_active_device_session() or caller_role not in ('school_admin', 'super_admin') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select p.preferred_workspace into caller_workspace
  from public.profiles p
  where p.user_id = (select auth.uid());

  select * into existing from public.student_profiles where user_id = p_student_user_id for update;
  if existing.user_id is null or not private.can_admin_school(existing.school_id) then
    raise exception 'Student access denied' using errcode = '42501';
  end if;
  if caller_role = 'school_admin' and p_status in ('active_advanced', 'banned') then
    raise exception 'This transition requires Super Admin approval' using errcode = '42501';
  end if;

  required_workspace := case
    when p_status = 'active_advanced' then 'advanced'::public.admin_workspace
    when p_status = 'pending_activation' and caller_role = 'super_admin' then caller_workspace
    else 'normal'::public.admin_workspace
  end;

  if p_status in ('pending_activation', 'active_normal', 'active_advanced')
    and not private.has_valid_student_entitlement(p_student_user_id, required_workspace, true) then
    if existing.school_id is null then
      raise exception 'A valid successful payment, subscription or explicit entitlement is required'
        using errcode = '23514';
    end if;

    select a.id into existing_assignment
    from public.school_license_assignments a
    where a.student_user_id = p_student_user_id and a.released_at is null
    for update;

    select pool.id into selected_pool
    from public.school_license_pools pool
    where pool.school_id = existing.school_id
      and pool.valid_from <= current_date
      and pool.valid_until >= current_date
      and (required_workspace = 'normal'::public.admin_workspace or pool.workspace = 'advanced'::public.admin_workspace)
      and (
        select count(*)
        from public.school_license_assignments a
        where a.pool_id = pool.id and a.released_at is null
      ) < pool.purchased_quantity
    order by pool.valid_until, pool.created_at
    limit 1
    for update skip locked;

    if selected_pool is null then
      raise exception 'No valid entitlement or school licence is available for activation' using errcode = '23514';
    end if;

    if existing_assignment is not null then
      update public.school_license_assignments
      set released_at = now(), release_reason = 'workspace_reassignment'
      where id = existing_assignment;
    end if;

    insert into public.school_license_assignments (pool_id, school_id, student_user_id, assigned_by)
    values (selected_pool, existing.school_id, p_student_user_id, (select auth.uid()));
  end if;

  if p_status in ('banned', 'expired') then
    update public.school_license_assignments
    set released_at = now(), release_reason = p_status::text
    where student_user_id = p_student_user_id and released_at is null;
  end if;

  update public.student_profiles
  set status = p_status,
      status_reason = nullif(btrim(p_reason), ''),
      expires_at = case when p_status in ('active_normal', 'active_advanced') and existing.status = 'expired' then null else expires_at end
  where user_id = p_student_user_id
  returning * into result;

  perform private.log_admin_action(
    'student.status_changed', 'student', p_student_user_id::text, existing.school_id,
    to_jsonb(existing), to_jsonb(result), p_reason
  );
  return result;
end;
$$;

revoke all on function public.admin_grant_student_entitlement(uuid, public.admin_workspace, timestamptz, text)
from public, anon, authenticated;
grant execute on function public.admin_grant_student_entitlement(uuid, public.admin_workspace, timestamptz, text)
to service_role;
