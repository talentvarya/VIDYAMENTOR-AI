-- VIDYAMENTOR AI Phase 1: identity, workflow functions, explicit grants and RLS.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.user_id = (select auth.uid())
    and p.is_enabled = true
$$;

create or replace function private.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.school_id
  from public.profiles p
  where p.user_id = (select auth.uid())
    and p.is_enabled = true
$$;

create or replace function private.has_active_device_session()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_device_sessions s
    where s.user_id = (select auth.uid())
      and s.auth_session_id::text = coalesce((select auth.jwt()) ->> 'session_id', '')
      and s.revoked_at is null
  )
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_role() = 'super_admin'::public.app_role
    and private.has_active_device_session()
$$;

create or replace function private.can_admin_school(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_active_device_session()
    and (
      private.current_role() = 'super_admin'::public.app_role
      or (
        private.current_role() = 'school_admin'::public.app_role
        and private.current_school_id() is not distinct from target_school_id
      )
    )
$$;

create or replace function private.can_access_learning(required_difficulty text default 'normal')
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_active_device_session()
    and (
      private.current_role() in ('school_admin'::public.app_role, 'super_admin'::public.app_role)
      or exists (
        select 1
        from public.student_profiles s
        join public.profiles p on p.user_id = s.user_id
        where s.user_id = (select auth.uid())
          and p.is_enabled = true
          and (
            s.status = 'active_advanced'::public.student_status
            or (
              s.status = 'active_normal'::public.student_status
              and required_difficulty = 'normal'
            )
          )
          and (s.expires_at is null or s.expires_at > now())
      )
    )
$$;

create or replace function private.validate_normal_phase_age()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.date_of_birth > current_date then
    raise exception 'Date of birth cannot be in the future' using errcode = '22007';
  end if;
  if new.date_of_birth <= (current_date - interval '21 years')::date then
    raise exception 'Normal Phase is limited to students aged 20 or younger' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger student_profiles_validate_age
before insert or update of date_of_birth on public.student_profiles
for each row execute function private.validate_normal_phase_age();

create trigger student_invites_validate_age
before insert or update of date_of_birth on public.student_invites
for each row execute function private.validate_normal_phase_age();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  matching_invite public.student_invites%rowtype;
begin
  select i.*
  into matching_invite
  from public.student_invites i
  where lower(i.email) = lower(new.email)
    and i.claimed_at is null
    and i.expires_at > now()
  order by i.created_at
  limit 1
  for update skip locked;

  insert into public.profiles (user_id, role, school_id, display_name, email)
  values (
    new.id,
    'student'::public.app_role,
    matching_invite.school_id,
    matching_invite.full_name,
    lower(new.email)
  )
  on conflict (user_id) do update set
    email = excluded.email,
    updated_at = now();

  if matching_invite.id is not null then
    insert into public.student_profiles (
      user_id, school_id, full_name, email, date_of_birth, class_level, board,
      student_id, school_name, section, language_1, language_2, status, created_by
    )
    values (
      new.id, matching_invite.school_id, matching_invite.full_name, lower(new.email),
      matching_invite.date_of_birth, matching_invite.class_level, matching_invite.board,
      matching_invite.student_id,
      (select s.name from public.schools s where s.id = matching_invite.school_id),
      matching_invite.section, matching_invite.language_1,
      matching_invite.language_2, 'pending_verification'::public.student_status,
      matching_invite.created_by
    )
    on conflict (user_id) do nothing;

    update public.student_invites
    set invited_user_id = new.id,
        claimed_at = now(),
        updated_at = now()
    where id = matching_invite.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create or replace function private.validate_student_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = new.status then
    return new;
  end if;

  if not (
    (old.status = 'created_draft' and new.status = 'pending_verification')
    or (old.status = 'pending_verification' and new.status in ('pending_payment', 'pending_activation', 'suspended', 'banned'))
    or (old.status = 'pending_payment' and new.status in ('pending_activation', 'suspended', 'banned', 'expired'))
    or (old.status = 'pending_activation' and new.status in ('active_normal', 'active_advanced', 'suspended', 'banned', 'expired'))
    or (old.status = 'active_normal' and new.status in ('active_advanced', 'suspended', 'banned', 'expired'))
    or (old.status = 'active_advanced' and new.status in ('active_normal', 'suspended', 'banned', 'expired'))
    or (old.status = 'suspended' and new.status in ('active_normal', 'active_advanced', 'banned', 'expired'))
    or (old.status = 'expired' and new.status in ('pending_payment', 'pending_activation'))
  ) then
    raise exception 'Invalid student status transition: % -> %', old.status, new.status using errcode = '23514';
  end if;

  if new.status = 'pending_verification' and new.verified_at is null then
    new.verified_at = now();
  elsif old.status = 'pending_payment' and new.status = 'pending_activation' and new.paid_at is null then
    new.paid_at = now();
  elsif new.status in ('active_normal', 'active_advanced') and new.activated_at is null then
    new.activated_at = now();
  end if;

  return new;
end;
$$;

create trigger student_profiles_validate_status_transition
before update of status on public.student_profiles
for each row execute function private.validate_student_status_transition();

create or replace function private.record_student_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.student_status_history (
      student_user_id, school_id, from_status, to_status, reason, changed_by
    ) values (
      new.user_id,
      new.school_id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      new.status_reason,
      (select auth.uid())
    );
  end if;
  return new;
end;
$$;

create trigger student_profiles_record_status_history
after insert or update of status on public.student_profiles
for each row execute function private.record_student_status_history();

create or replace function private.log_admin_action(
  action_name text,
  target_type_name text,
  target_id_value text,
  target_school_id uuid,
  before_value jsonb,
  after_value jsonb,
  action_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_audit_logs (
    actor_user_id, actor_role, school_id, action, target_type, target_id,
    before_data, after_data, reason
  ) values (
    (select auth.uid()), private.current_role(), target_school_id, action_name,
    target_type_name, target_id_value, before_value, after_value, action_reason
  );
end;
$$;

create or replace function public.get_access_context()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'userId', p.user_id,
    'email', p.email,
    'displayName', p.display_name,
    'role', p.role,
    'schoolId', p.school_id,
    'schoolName', sc.name,
    'schoolCode', sc.code,
    'workspace', p.preferred_workspace,
    'isEnabled', p.is_enabled,
    'student', case when s.user_id is null then null else jsonb_build_object(
      'fullName', s.full_name,
      'dateOfBirth', s.date_of_birth,
      'classLevel', s.class_level,
      'board', s.board,
      'studentId', s.student_id,
      'schoolName', s.school_name,
      'section', s.section,
      'language1', s.language_1,
      'language2', s.language_2,
      'status', s.status,
      'statusReason', s.status_reason,
      'expiresAt', s.expires_at
    ) end,
    'hasActiveDeviceSession', private.has_active_device_session(),
    'canAccessLearning', private.can_access_learning(
      case when s.status = 'active_advanced' then 'advanced' else 'normal' end
    )
  )
  from public.profiles p
  left join public.schools sc on sc.id = p.school_id
  left join public.student_profiles s on s.user_id = p.user_id
  where p.user_id = (select auth.uid())
$$;

create or replace function public.submit_student_profile(
  p_full_name text,
  p_email text,
  p_date_of_birth date,
  p_class_level text,
  p_board text,
  p_student_id text,
  p_school_name text,
  p_school_code text default null,
  p_section text default null,
  p_language_1 text default 'English',
  p_language_2 text default null
)
returns public.student_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_email text;
  resolved_school_id uuid;
  existing_status public.student_status;
  result public.student_profiles;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select lower(u.email) into caller_email from auth.users u where u.id = caller_id;
  if caller_email is null or caller_email <> lower(btrim(p_email)) then
    raise exception 'Profile email must match the authenticated email' using errcode = '42501';
  end if;
  if p_date_of_birth > current_date or p_date_of_birth <= (current_date - interval '21 years')::date then
    raise exception 'Normal Phase is limited to students aged 20 or younger' using errcode = '23514';
  end if;
  if p_language_2 is not null and lower(btrim(p_language_1)) = lower(btrim(p_language_2)) then
    raise exception 'Language 1 and Language 2 must be different' using errcode = '23514';
  end if;
  if exists (select 1 from public.profiles p where p.user_id = caller_id and p.role <> 'student') then
    raise exception 'Only student accounts can submit a student profile' using errcode = '42501';
  end if;

  if nullif(btrim(p_school_code), '') is not null then
    select s.id into resolved_school_id
    from public.schools s
    where lower(s.code) = lower(btrim(p_school_code)) and s.status = 'active';
    if resolved_school_id is null then
      raise exception 'School code is invalid or inactive' using errcode = '22023';
    end if;
  else
    select p.school_id into resolved_school_id from public.profiles p where p.user_id = caller_id;
  end if;

  select s.status into existing_status from public.student_profiles s where s.user_id = caller_id;
  if existing_status is not null and existing_status not in ('created_draft', 'pending_verification') then
    raise exception 'This student profile can no longer be edited directly' using errcode = '42501';
  end if;

  update public.profiles
  set display_name = btrim(p_full_name),
      email = caller_email,
      school_id = resolved_school_id,
      updated_at = now()
  where user_id = caller_id;

  insert into public.student_profiles (
    user_id, school_id, full_name, email, date_of_birth, class_level, board,
    student_id, school_name, section, language_1, language_2, status, verified_at
  ) values (
    caller_id, resolved_school_id, btrim(p_full_name), caller_email, p_date_of_birth,
    btrim(p_class_level), btrim(p_board), btrim(p_student_id), btrim(p_school_name), nullif(btrim(p_section), ''),
    btrim(p_language_1), nullif(btrim(p_language_2), ''),
    'pending_verification'::public.student_status, now()
  )
  on conflict (user_id) do update set
    school_id = excluded.school_id,
    full_name = excluded.full_name,
    date_of_birth = excluded.date_of_birth,
    class_level = excluded.class_level,
    board = excluded.board,
    student_id = excluded.student_id,
    school_name = excluded.school_name,
    section = excluded.section,
    language_1 = excluded.language_1,
    language_2 = excluded.language_2,
    status = 'pending_verification'::public.student_status,
    verified_at = now(),
    updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.claim_device_session(
  p_device_id text,
  p_device_name text default null,
  p_force boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  current_auth_session text := coalesce((select auth.jwt()) ->> 'session_id', '');
  existing public.user_device_sessions%rowtype;
  created_session public.user_device_sessions%rowtype;
begin
  if caller_id is null or current_auth_session = '' then
    raise exception 'A valid authenticated session is required' using errcode = '28000';
  end if;
  if length(btrim(p_device_id)) not between 8 and 200 then
    raise exception 'Invalid device identifier' using errcode = '22023';
  end if;

  select * into existing
  from public.user_device_sessions s
  where s.user_id = caller_id and s.revoked_at is null
  for update;

  if existing.id is not null and existing.auth_session_id::text = current_auth_session then
    update public.user_device_sessions
    set device_id = btrim(p_device_id), device_name = nullif(btrim(p_device_name), ''), last_seen_at = now()
    where id = existing.id
    returning * into created_session;
    return jsonb_build_object('ok', true, 'replaced', false, 'sessionId', created_session.id);
  end if;

  if existing.id is not null and not p_force then
    return jsonb_build_object(
      'ok', false,
      'conflict', true,
      'otherDeviceName', existing.device_name,
      'lastSeenAt', existing.last_seen_at
    );
  end if;

  if existing.id is not null then
    update public.user_device_sessions
    set revoked_at = now(), revoked_reason = 'replaced_by_user'
    where id = existing.id;
  end if;

  insert into public.user_device_sessions (user_id, auth_session_id, device_id, device_name)
  values (caller_id, current_auth_session::uuid, btrim(p_device_id), nullif(btrim(p_device_name), ''))
  returning * into created_session;

  return jsonb_build_object('ok', true, 'replaced', existing.id is not null, 'sessionId', created_session.id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'conflict', true, 'message', 'Another session became active. Try again.');
end;
$$;

create or replace function public.set_admin_workspace(p_workspace public.admin_workspace)
returns public.admin_workspace
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.current_role() <> 'super_admin' or not private.has_active_device_session() then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;
  update public.profiles set preferred_workspace = p_workspace where user_id = (select auth.uid());
  return p_workspace;
end;
$$;

create or replace function public.school_create_student_invite(
  p_full_name text,
  p_email text,
  p_date_of_birth date,
  p_class_level text,
  p_board text,
  p_student_id text,
  p_section text default null,
  p_language_1 text default 'English',
  p_language_2 text default null,
  p_school_id uuid default null
)
returns public.student_invites
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role public.app_role := private.current_role();
  resolved_school_id uuid;
  result public.student_invites;
begin
  if not private.has_active_device_session() or caller_role not in ('school_admin', 'super_admin') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  resolved_school_id := case when caller_role = 'school_admin' then private.current_school_id() else p_school_id end;
  if resolved_school_id is null or not private.can_admin_school(resolved_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if p_date_of_birth > current_date or p_date_of_birth <= (current_date - interval '21 years')::date then
    raise exception 'Normal Phase is limited to students aged 20 or younger' using errcode = '23514';
  end if;

  insert into public.student_invites (
    school_id, email, full_name, date_of_birth, class_level, board, student_id,
    section, language_1, language_2, created_by
  ) values (
    resolved_school_id, lower(btrim(p_email)), btrim(p_full_name), p_date_of_birth,
    btrim(p_class_level), btrim(p_board), btrim(p_student_id), nullif(btrim(p_section), ''),
    btrim(p_language_1), nullif(btrim(p_language_2), ''), (select auth.uid())
  ) returning * into result;

  perform private.log_admin_action(
    'student.invite_created', 'student_invite', result.id::text, resolved_school_id,
    null, to_jsonb(result), null
  );
  return result;
end;
$$;

create or replace function public.school_create_bulk_import(
  p_filename text,
  p_source_format text,
  p_rows jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  school uuid := private.current_school_id();
  import_id uuid;
  item jsonb;
  row_no integer := 0;
  valid_count integer := 0;
  row_valid boolean;
begin
  if private.current_role() <> 'school_admin' or not private.has_active_device_session() or school is null then
    raise exception 'School Admin access required' using errcode = '42501';
  end if;
  if p_source_format not in ('csv', 'xlsx') then
    raise exception 'Only CSV or XLSX imports are supported' using errcode = '22023';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 or jsonb_array_length(p_rows) > 1000 then
    raise exception 'Import must contain between 1 and 1000 rows' using errcode = '22023';
  end if;

  insert into public.bulk_student_imports (
    school_id, source_format, original_filename, status, total_rows, created_by
  ) values (
    school, p_source_format, btrim(p_filename), 'validating', jsonb_array_length(p_rows), (select auth.uid())
  ) returning id into import_id;

  for item in select value from jsonb_array_elements(p_rows)
  loop
    row_no := row_no + 1;
    row_valid := coalesce(item ->> 'full_name', '') <> ''
      and coalesce(item ->> 'email', '') ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
      and coalesce(item ->> 'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$'
      and coalesce(item ->> 'class_level', '') <> ''
      and coalesce(item ->> 'board', '') <> ''
      and coalesce(item ->> 'student_id', '') <> ''
      and coalesce(item ->> 'language_1', '') <> '';
    if row_valid then valid_count := valid_count + 1; end if;

    insert into public.bulk_student_import_rows (
      import_id, row_number, raw_data, normalized_data, status, validation_errors
    ) values (
      import_id,
      row_no,
      item,
      case when row_valid then item else null end,
      case when row_valid then 'valid'::public.import_row_status else 'invalid'::public.import_row_status end,
      case when row_valid then '[]'::jsonb else '["Missing or invalid required fields"]'::jsonb end
    );
  end loop;

  update public.bulk_student_imports
  set status = 'ready', valid_rows = valid_count,
      invalid_rows = jsonb_array_length(p_rows) - valid_count
  where id = import_id;

  perform private.log_admin_action(
    'student_import.validated', 'bulk_student_import', import_id::text, school,
    null, jsonb_build_object('total', jsonb_array_length(p_rows), 'valid', valid_count), null
  );
  return import_id;
end;
$$;

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
  existing public.student_profiles%rowtype;
  result public.student_profiles;
  selected_pool uuid;
begin
  if not private.has_active_device_session() or caller_role not in ('school_admin', 'super_admin') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select * into existing from public.student_profiles where user_id = p_student_user_id for update;
  if existing.user_id is null or not private.can_admin_school(existing.school_id) then
    raise exception 'Student access denied' using errcode = '42501';
  end if;
  if caller_role = 'school_admin' and p_status in ('active_advanced', 'banned') then
    raise exception 'This transition requires Super Admin approval' using errcode = '42501';
  end if;

  if p_status in ('active_normal', 'active_advanced') and existing.school_id is not null
     and not exists (
       select 1 from public.school_license_assignments a
       where a.student_user_id = p_student_user_id and a.released_at is null
     ) then
    select p.id into selected_pool
    from public.school_license_pools p
    where p.school_id = existing.school_id
      and p.valid_from <= current_date
      and p.valid_until >= current_date
      and (p.workspace = 'advanced' or p_status = 'active_normal')
      and (
        select count(*) from public.school_license_assignments a
        where a.pool_id = p.id and a.released_at is null
      ) < p.purchased_quantity
    order by p.valid_until, p.created_at
    limit 1
    for update skip locked;

    if selected_pool is null then
      raise exception 'No school licence is available for activation' using errcode = '23514';
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
  set status = p_status, status_reason = nullif(btrim(p_reason), '')
  where user_id = p_student_user_id
  returning * into result;

  perform private.log_admin_action(
    'student.status_changed', 'student', p_student_user_id::text, existing.school_id,
    to_jsonb(existing), to_jsonb(result), p_reason
  );
  return result;
end;
$$;

create or replace function public.admin_review_free_education(
  p_request_id uuid,
  p_status public.request_status,
  p_notes text default null
)
returns public.free_education_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.free_education_requests%rowtype;
  result public.free_education_requests;
begin
  if not private.is_super_admin() then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;
  if p_status = 'pending' then
    raise exception 'A review must choose an outcome' using errcode = '22023';
  end if;
  select * into existing from public.free_education_requests where id = p_request_id for update;
  if existing.id is null then raise exception 'Request not found' using errcode = 'P0002'; end if;

  update public.free_education_requests
  set status = p_status,
      reviewer_notes = nullif(btrim(p_notes), ''),
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = p_request_id
  returning * into result;

  perform private.log_admin_action(
    'free_education.reviewed', 'free_education_request', p_request_id::text, existing.school_id,
    to_jsonb(existing), to_jsonb(result), p_notes
  );
  return result;
end;
$$;

create or replace function public.admin_update_pricing(
  p_code text,
  p_amount_minor integer,
  p_features jsonb,
  p_is_active boolean
)
returns public.pricing_plans
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.pricing_plans%rowtype;
  result public.pricing_plans;
begin
  if not private.is_super_admin() then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;
  if p_amount_minor < 0 or jsonb_typeof(p_features) <> 'array' then
    raise exception 'Invalid pricing values' using errcode = '22023';
  end if;
  select * into existing from public.pricing_plans where code = p_code for update;
  if existing.code is null then raise exception 'Pricing plan not found' using errcode = 'P0002'; end if;

  update public.pricing_plans
  set amount_minor = p_amount_minor, features = p_features, is_active = p_is_active
  where code = p_code
  returning * into result;
  perform private.log_admin_action(
    'pricing.updated', 'pricing_plan', p_code, null, to_jsonb(existing), to_jsonb(result), null
  );
  return result;
end;
$$;

-- PostgreSQL grants function execution to PUBLIC by default. Close that default
-- before selectively exposing only the caller-safe RPCs below.
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

-- RLS is enabled on every table in the exposed public schema. Tables without a policy are service-role only.
do $$
declare
  target record;
begin
  for target in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', target.tablename);
    execute format('alter table public.%I force row level security', target.tablename);
  end loop;
end;
$$;

-- Explicit API privileges. Sensitive writes are only available through the vetted RPCs above.
grant select on public.pricing_plans to anon, authenticated;
grant select on public.schools, public.profiles, public.student_profiles, public.student_status_history,
  public.user_device_sessions, public.student_invites, public.bulk_student_imports,
  public.bulk_student_import_rows, public.school_license_pools, public.school_license_assignments,
  public.school_license_summary, public.free_education_requests, public.school_enquiries,
  public.subscriptions, public.payments, public.invoices, public.school_contracts,
  public.kb_boards, public.kb_academic_years, public.kb_classes, public.kb_subjects,
  public.kb_chapters, public.kb_topics, public.kb_lessons, public.kb_sources,
  public.kb_documents, public.kb_chunks, public.courses, public.course_enrollments,
  public.tests, public.test_attempts, public.student_notes, public.community_posts,
  public.ai_usage_events, public.violations, public.strikes, public.appeals,
  public.support_tickets, public.support_ticket_messages, public.notifications,
  public.admin_audit_logs to authenticated;
grant insert, update, delete on public.student_notes, public.community_posts to authenticated;
grant insert on public.appeals, public.support_tickets, public.support_ticket_messages to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant usage, select on all sequences in schema public to authenticated;

grant execute on function private.current_role() to authenticated;
grant execute on function private.current_school_id() to authenticated;
grant execute on function private.has_active_device_session() to authenticated;
grant execute on function private.is_super_admin() to authenticated;
grant execute on function private.can_admin_school(uuid) to authenticated;
grant execute on function private.can_access_learning(text) to authenticated;
grant execute on function public.get_access_context() to authenticated;
grant execute on function public.submit_student_profile(text, text, date, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.claim_device_session(text, text, boolean) to authenticated;
grant execute on function public.set_admin_workspace(public.admin_workspace) to authenticated;
grant execute on function public.school_create_student_invite(text, text, date, text, text, text, text, text, text, uuid) to authenticated;
grant execute on function public.school_create_bulk_import(text, text, jsonb) to authenticated;
grant execute on function public.admin_set_student_status(uuid, public.student_status, text) to authenticated;
grant execute on function public.admin_review_free_education(uuid, public.request_status, text) to authenticated;
grant execute on function public.admin_update_pricing(text, integer, jsonb, boolean) to authenticated;

create policy pricing_anon_read on public.pricing_plans
for select to anon using (is_active = true);
create policy pricing_authenticated_read on public.pricing_plans
for select to authenticated using (is_active = true or private.is_super_admin());

create policy schools_tenant_read on public.schools
for select to authenticated using (private.can_admin_school(id) or id = private.current_school_id());

create policy profiles_scoped_read on public.profiles
for select to authenticated using (
  user_id = (select auth.uid())
  or private.is_super_admin()
  or (private.current_role() = 'school_admin' and school_id = private.current_school_id() and private.has_active_device_session())
);

create policy student_profiles_scoped_read on public.student_profiles
for select to authenticated using (
  user_id = (select auth.uid())
  or private.is_super_admin()
  or (private.current_role() = 'school_admin' and school_id = private.current_school_id() and private.has_active_device_session())
);

create policy student_status_history_scoped_read on public.student_status_history
for select to authenticated using (
  student_user_id = (select auth.uid())
  or private.is_super_admin()
  or (private.current_role() = 'school_admin' and school_id = private.current_school_id() and private.has_active_device_session())
);

create policy device_sessions_owner_read on public.user_device_sessions
for select to authenticated using (user_id = (select auth.uid()));

create policy student_invites_admin_read on public.student_invites
for select to authenticated using (private.can_admin_school(school_id));

create policy bulk_imports_admin_read on public.bulk_student_imports
for select to authenticated using (private.can_admin_school(school_id));

create policy bulk_import_rows_admin_read on public.bulk_student_import_rows
for select to authenticated using (
  exists (
    select 1 from public.bulk_student_imports i
    where i.id = import_id and private.can_admin_school(i.school_id)
  )
);

create policy license_pools_admin_read on public.school_license_pools
for select to authenticated using (private.can_admin_school(school_id));

create policy license_assignments_scoped_read on public.school_license_assignments
for select to authenticated using (
  student_user_id = (select auth.uid()) or private.can_admin_school(school_id)
);

create policy free_requests_scoped_read on public.free_education_requests
for select to authenticated using (
  applicant_user_id = (select auth.uid())
  or private.is_super_admin()
  or (school_id is not null and private.can_admin_school(school_id))
);

create policy school_enquiries_super_read on public.school_enquiries
for select to authenticated using (private.is_super_admin());

create policy subscriptions_scoped_read on public.subscriptions
for select to authenticated using (
  user_id = (select auth.uid())
  or (school_id is not null and private.can_admin_school(school_id))
  or private.is_super_admin()
);

create policy payments_scoped_read on public.payments
for select to authenticated using (
  user_id = (select auth.uid())
  or (school_id is not null and private.can_admin_school(school_id))
  or private.is_super_admin()
);

create policy invoices_scoped_read on public.invoices
for select to authenticated using (
  user_id = (select auth.uid())
  or (school_id is not null and private.can_admin_school(school_id))
  or private.is_super_admin()
);

create policy school_contracts_admin_read on public.school_contracts
for select to authenticated using (private.can_admin_school(school_id));

create policy kb_boards_protected_read on public.kb_boards
for select to authenticated using (is_active and private.can_access_learning('normal'));
create policy kb_academic_years_protected_read on public.kb_academic_years
for select to authenticated using (is_active and private.can_access_learning('normal'));
create policy kb_classes_protected_read on public.kb_classes
for select to authenticated using (is_active and private.can_access_learning('normal'));
create policy kb_subjects_protected_read on public.kb_subjects
for select to authenticated using (is_active and private.can_access_learning('normal'));
create policy kb_chapters_protected_read on public.kb_chapters
for select to authenticated using (is_published and private.can_access_learning('normal'));
create policy kb_topics_protected_read on public.kb_topics
for select to authenticated using (is_published and private.can_access_learning('normal'));
create policy kb_lessons_protected_read on public.kb_lessons
for select to authenticated using (is_published and private.can_access_learning(difficulty));

create policy kb_sources_super_read on public.kb_sources
for select to authenticated using (private.is_super_admin());
create policy kb_documents_super_read on public.kb_documents
for select to authenticated using (private.is_super_admin());
create policy kb_chunks_super_read on public.kb_chunks
for select to authenticated using (private.is_super_admin());

create policy courses_protected_read on public.courses
for select to authenticated using (is_published and private.can_access_learning(difficulty));

create policy enrollments_scoped_read on public.course_enrollments
for select to authenticated using (
  (student_user_id = (select auth.uid()) and private.can_access_learning('normal'))
  or private.can_admin_school(school_id)
);

create policy tests_protected_read on public.tests
for select to authenticated using (is_published and private.can_access_learning(difficulty));

create policy test_attempts_scoped_read on public.test_attempts
for select to authenticated using (
  (student_user_id = (select auth.uid()) and private.can_access_learning('normal'))
  or private.can_admin_school(school_id)
);
create policy test_attempts_owner_insert on public.test_attempts
for insert to authenticated with check (
  student_user_id = (select auth.uid())
  and school_id is not distinct from private.current_school_id()
  and private.can_access_learning('normal')
);
create policy test_attempts_owner_update on public.test_attempts
for update to authenticated using (
  student_user_id = (select auth.uid()) and private.can_access_learning('normal')
) with check (
  student_user_id = (select auth.uid())
  and school_id is not distinct from private.current_school_id()
  and private.can_access_learning('normal')
);

create policy student_notes_scoped_read on public.student_notes
for select to authenticated using (
  (student_user_id = (select auth.uid()) and private.can_access_learning('normal'))
  or private.can_admin_school(school_id)
);
create policy student_notes_owner_insert on public.student_notes
for insert to authenticated with check (
  student_user_id = (select auth.uid())
  and school_id is not distinct from private.current_school_id()
  and private.can_access_learning('normal')
);
create policy student_notes_owner_update on public.student_notes
for update to authenticated using (
  student_user_id = (select auth.uid()) and private.can_access_learning('normal')
) with check (
  student_user_id = (select auth.uid())
  and school_id is not distinct from private.current_school_id()
  and private.can_access_learning('normal')
);
create policy student_notes_owner_delete on public.student_notes
for delete to authenticated using (
  student_user_id = (select auth.uid()) and private.can_access_learning('normal')
);

create policy community_posts_scoped_read on public.community_posts
for select to authenticated using (
  private.can_access_learning('normal')
  and not is_hidden
  and (school_id is null or school_id is not distinct from private.current_school_id() or private.is_super_admin())
);
create policy community_posts_owner_insert on public.community_posts
for insert to authenticated with check (
  author_user_id = (select auth.uid())
  and school_id is not distinct from private.current_school_id()
  and private.can_access_learning('normal')
);
create policy community_posts_owner_update on public.community_posts
for update to authenticated using (
  author_user_id = (select auth.uid()) and private.can_access_learning('normal')
) with check (
  author_user_id = (select auth.uid())
  and school_id is not distinct from private.current_school_id()
);
create policy community_posts_owner_delete on public.community_posts
for delete to authenticated using (author_user_id = (select auth.uid()));

create policy ai_usage_scoped_read on public.ai_usage_events
for select to authenticated using (
  user_id = (select auth.uid()) or private.can_admin_school(school_id) or private.is_super_admin()
);

create policy violations_scoped_read on public.violations
for select to authenticated using (
  user_id = (select auth.uid()) or private.can_admin_school(school_id) or private.is_super_admin()
);
create policy strikes_scoped_read on public.strikes
for select to authenticated using (
  user_id = (select auth.uid())
  or exists (select 1 from public.violations v where v.id = violation_id and private.can_admin_school(v.school_id))
  or private.is_super_admin()
);

create policy appeals_scoped_read on public.appeals
for select to authenticated using (
  appellant_user_id = (select auth.uid())
  or exists (select 1 from public.violations v where v.id = violation_id and private.can_admin_school(v.school_id))
  or private.is_super_admin()
);
create policy appeals_owner_insert on public.appeals
for insert to authenticated with check (
  appellant_user_id = (select auth.uid())
  and exists (select 1 from public.violations v where v.id = violation_id and v.user_id = (select auth.uid()))
);
create policy appeals_owner_update on public.appeals
for update to authenticated using (
  appellant_user_id = (select auth.uid()) and status = 'pending'
) with check (appellant_user_id = (select auth.uid()));

create policy support_tickets_scoped_read on public.support_tickets
for select to authenticated using (
  requester_user_id = (select auth.uid())
  or private.can_admin_school(school_id)
  or private.is_super_admin()
);
create policy support_tickets_owner_insert on public.support_tickets
for insert to authenticated with check (
  requester_user_id = (select auth.uid())
  and school_id is not distinct from private.current_school_id()
);
create policy support_tickets_owner_update on public.support_tickets
for update to authenticated using (requester_user_id = (select auth.uid()))
with check (requester_user_id = (select auth.uid()));

create policy support_messages_scoped_read on public.support_ticket_messages
for select to authenticated using (
  exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id
      and (
        t.requester_user_id = (select auth.uid())
        or private.can_admin_school(t.school_id)
        or private.is_super_admin()
      )
      and (not is_internal or private.current_role() in ('school_admin', 'super_admin'))
  )
);
create policy support_messages_scoped_insert on public.support_ticket_messages
for insert to authenticated with check (
  sender_user_id = (select auth.uid())
  and exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id
      and (
        t.requester_user_id = (select auth.uid())
        or private.can_admin_school(t.school_id)
        or private.is_super_admin()
      )
  )
  and (not is_internal or private.current_role() in ('school_admin', 'super_admin'))
);

create policy notifications_owner_read on public.notifications
for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_owner_update on public.notifications
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy audit_logs_admin_read on public.admin_audit_logs
for select to authenticated using (
  private.is_super_admin()
  or (private.current_role() = 'school_admin' and school_id = private.current_school_id() and private.has_active_device_session())
);
