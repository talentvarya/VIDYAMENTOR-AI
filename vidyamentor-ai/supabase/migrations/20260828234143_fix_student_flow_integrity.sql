-- VIDYAMENTOR AI Phase 1: close student login, entitlement, session and content-integrity gaps.

-- Language choices must already be valid before the stricter constraints are installed.
-- This preserves valid existing records and fails closed instead of silently rewriting profiles.
do $$
begin
  if exists (
    select 1
    from public.student_profiles
    where nullif(btrim(language_1), '') is null
      or nullif(btrim(language_2), '') is null
      or lower(btrim(language_1)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
      or lower(btrim(language_2)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
      or lower(btrim(language_1)) = lower(btrim(language_2))
  ) then
    raise exception 'Existing student profiles contain invalid language selections';
  end if;

  if exists (
    select 1
    from public.student_invites
    where nullif(btrim(language_1), '') is null
      or nullif(btrim(language_2), '') is null
      or lower(btrim(language_1)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
      or lower(btrim(language_2)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
      or lower(btrim(language_1)) = lower(btrim(language_2))
  ) then
    raise exception 'Existing student invites contain invalid language selections';
  end if;
end;
$$;

alter table public.student_profiles
  alter column language_2 set not null,
  drop constraint student_profiles_languages_distinct,
  add constraint student_profiles_language_1_supported check (
    lower(btrim(language_1)) in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
  ),
  add constraint student_profiles_language_2_supported check (
    lower(btrim(language_2)) in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
  ),
  add constraint student_profiles_languages_distinct check (
    lower(btrim(language_1)) <> lower(btrim(language_2))
  );

alter table public.student_invites
  alter column language_2 set not null,
  drop constraint student_invites_languages_distinct,
  add constraint student_invites_language_1_supported check (
    lower(btrim(language_1)) in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
  ),
  add constraint student_invites_language_2_supported check (
    lower(btrim(language_2)) in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
  ),
  add constraint student_invites_languages_distinct check (
    lower(btrim(language_1)) <> lower(btrim(language_2))
  );

-- Explicit non-payment entitlements. Paid subscriptions/payments and school licences remain
-- authoritative in their existing tables; Free Education and manual grants are recorded here.
create table public.student_entitlements (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  workspace public.admin_workspace not null default 'normal',
  source_type text not null check (source_type in ('free_education', 'admin_grant')),
  free_education_request_id uuid unique references public.free_education_requests(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  granted_by uuid not null references public.profiles(user_id) on delete restrict,
  grant_reason text not null,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_entitlements_dates check (valid_until is null or valid_until > valid_from),
  constraint student_entitlements_reason_not_blank check (length(btrim(grant_reason)) > 0),
  constraint student_entitlements_source_link check (
    (source_type = 'free_education' and free_education_request_id is not null)
    or (source_type = 'admin_grant' and free_education_request_id is null)
  )
);

create index student_entitlements_student_active_idx
  on public.student_entitlements (student_user_id, workspace, valid_until)
  where status = 'active';

create trigger student_entitlements_set_updated_at
before update on public.student_entitlements
for each row execute function private.set_updated_at();

alter table public.student_entitlements enable row level security;
alter table public.student_entitlements force row level security;
revoke all on public.student_entitlements from public, anon, authenticated;
grant select on public.student_entitlements to authenticated;

create policy student_entitlements_scoped_read on public.student_entitlements
for select to authenticated using (
  student_user_id = (select auth.uid())
  or private.is_super_admin()
  or exists (
    select 1
    from public.student_profiles s
    where s.user_id = student_user_id
      and s.school_id is not null
      and private.can_admin_school(s.school_id)
  )
);

alter table public.payments
  add constraint payments_paid_requires_timestamp
  check (status <> 'paid' or paid_at is not null) not valid;
alter table public.payments validate constraint payments_paid_requires_timestamp;

create or replace function private.has_valid_student_entitlement(
  target_user_id uuid,
  required_workspace public.admin_workspace,
  include_school_licence boolean
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.student_entitlements e
      where e.student_user_id = target_user_id
        and e.status = 'active'
        and e.valid_from <= now()
        and (e.valid_until is null or e.valid_until > now())
        and (required_workspace = 'normal'::public.admin_workspace or e.workspace = 'advanced'::public.admin_workspace)
    )
    or exists (
      select 1
      from public.payments pay
      left join public.subscriptions sub on sub.id = pay.subscription_id
      left join public.pricing_plans plan on plan.code = sub.plan_code
      where (pay.user_id = target_user_id or sub.user_id = target_user_id)
        and pay.status = 'paid'
        and pay.paid_at is not null
        and (
          required_workspace = 'normal'::public.admin_workspace
          or plan.workspace = 'advanced'::public.admin_workspace
        )
    )
    or exists (
      select 1
      from public.subscriptions sub
      join public.pricing_plans plan on plan.code = sub.plan_code
      where sub.user_id = target_user_id
        and sub.status = 'active'
        and (sub.current_period_start is null or sub.current_period_start <= now())
        and (sub.current_period_end is null or sub.current_period_end > now())
        and (
          required_workspace = 'normal'::public.admin_workspace
          or plan.workspace = 'advanced'::public.admin_workspace
        )
    )
    or (
      include_school_licence
      and exists (
        select 1
        from public.school_license_assignments a
        join public.school_license_pools pool on pool.id = a.pool_id
        where a.student_user_id = target_user_id
          and a.released_at is null
          and pool.valid_from <= current_date
          and pool.valid_until >= current_date
          and (
            required_workspace = 'normal'::public.admin_workspace
            or pool.workspace = 'advanced'::public.admin_workspace
          )
      )
    )
$$;

revoke all on function private.has_valid_student_entitlement(uuid, public.admin_workspace, boolean)
from public, anon, authenticated;

-- Learning access now requires both an active status and a current entitlement.
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
          and private.has_valid_student_entitlement(
            s.user_id,
            case
              when required_difficulty = 'advanced' then 'advanced'::public.admin_workspace
              else 'normal'::public.admin_workspace
            end,
            true
          )
      )
    )
$$;

-- Status changes no longer infer payment. Entitlement is mandatory before the activation stage.
create or replace function private.validate_student_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  required_workspace public.admin_workspace;
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

  if new.status in ('pending_activation', 'active_normal', 'active_advanced') then
    required_workspace := case
      when new.status = 'active_advanced' then 'advanced'::public.admin_workspace
      else 'normal'::public.admin_workspace
    end;
    if not private.has_valid_student_entitlement(new.user_id, required_workspace, true) then
      raise exception 'A valid payment, subscription, school licence or explicit entitlement is required for activation'
        using errcode = '23514';
    end if;
  end if;

  if new.status = 'pending_verification' and new.verified_at is null then
    new.verified_at = now();
  elsif new.status in ('active_normal', 'active_advanced') and new.activated_at is null then
    new.activated_at = now();
  end if;

  return new;
end;
$$;

-- paid_at may only originate from a successful payment record.
update public.student_profiles s
set paid_at = null
where s.paid_at is not null
  and not exists (
    select 1
    from public.payments pay
    left join public.subscriptions sub on sub.id = pay.subscription_id
    where (pay.user_id = s.user_id or sub.user_id = s.user_id)
      and pay.status = 'paid'
      and pay.paid_at is not null
  );

create or replace function private.validate_student_paid_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.paid_at is distinct from old.paid_at
    and new.paid_at is not null
    and not exists (
      select 1
      from public.payments pay
      left join public.subscriptions sub on sub.id = pay.subscription_id
      where (pay.user_id = new.user_id or sub.user_id = new.user_id)
        and pay.status = 'paid'
        and pay.paid_at = new.paid_at
    ) then
    raise exception 'student_profiles.paid_at must reference a successful payment timestamp'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger student_profiles_validate_paid_at
before update of paid_at on public.student_profiles
for each row execute function private.validate_student_paid_at();

create or replace function private.sync_student_paid_at_from_payment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if new.status <> 'paid' or new.paid_at is null then
    return new;
  end if;

  target_user_id := new.user_id;
  if target_user_id is null and new.subscription_id is not null then
    select sub.user_id into target_user_id
    from public.subscriptions sub
    where sub.id = new.subscription_id;
  end if;

  if target_user_id is not null then
    update public.student_profiles
    set paid_at = new.paid_at
    where user_id = target_user_id
      and paid_at is distinct from new.paid_at;
  end if;
  return new;
end;
$$;

create trigger payments_sync_student_paid_at
after insert or update of status, paid_at on public.payments
for each row execute function private.sync_student_paid_at_from_payment();

-- Strict profile submission: both supported, distinct languages are required.
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
  p_language_1 text default null,
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
  if nullif(btrim(p_language_1), '') is null
    or lower(btrim(p_language_1)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati') then
    raise exception 'Language 1 must be a supported language' using errcode = '23514';
  end if;
  if nullif(btrim(p_language_2), '') is null
    or lower(btrim(p_language_2)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati') then
    raise exception 'Language 2 must be a supported language' using errcode = '23514';
  end if;
  if lower(btrim(p_language_1)) = lower(btrim(p_language_2)) then
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
    btrim(p_language_1), btrim(p_language_2),
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

create or replace function public.school_create_student_invite(
  p_full_name text,
  p_email text,
  p_date_of_birth date,
  p_class_level text,
  p_board text,
  p_student_id text,
  p_section text default null,
  p_language_1 text default null,
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
  if nullif(btrim(p_language_1), '') is null
    or lower(btrim(p_language_1)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
    or nullif(btrim(p_language_2), '') is null
    or lower(btrim(p_language_2)) not in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
    or lower(btrim(p_language_1)) = lower(btrim(p_language_2)) then
    raise exception 'Two distinct supported languages are required' using errcode = '23514';
  end if;

  insert into public.student_invites (
    school_id, email, full_name, date_of_birth, class_level, board, student_id,
    section, language_1, language_2, created_by
  ) values (
    resolved_school_id, lower(btrim(p_email)), btrim(p_full_name), p_date_of_birth,
    btrim(p_class_level), btrim(p_board), btrim(p_student_id), nullif(btrim(p_section), ''),
    btrim(p_language_1), btrim(p_language_2), (select auth.uid())
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
      and lower(btrim(coalesce(item ->> 'language_1', ''))) in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
      and lower(btrim(coalesce(item ->> 'language_2', ''))) in ('english', 'hinglish', 'hindi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati')
      and lower(btrim(coalesce(item ->> 'language_1', ''))) <> lower(btrim(coalesce(item ->> 'language_2', '')));
    if row_valid then valid_count := valid_count + 1; end if;

    insert into public.bulk_student_import_rows (
      import_id, row_number, raw_data, normalized_data, status, validation_errors
    ) values (
      import_id,
      row_no,
      item,
      case when row_valid then item else null end,
      case when row_valid then 'valid'::public.import_row_status else 'invalid'::public.import_row_status end,
      case when row_valid then '[]'::jsonb else '["Missing or invalid required fields, including two distinct supported languages"]'::jsonb end
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

-- Release only the current JWT/device-session pair; other devices remain protected.
create or replace function public.release_current_device_session()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  current_auth_session text := coalesce((select auth.jwt()) ->> 'session_id', '');
  released_count integer;
begin
  if caller_id is null or current_auth_session = '' then
    raise exception 'A valid authenticated session is required' using errcode = '28000';
  end if;

  update public.user_device_sessions
  set revoked_at = now(), revoked_reason = 'user_logout'
  where user_id = caller_id
    and auth_session_id::text = current_auth_session
    and revoked_at is null;
  get diagnostics released_count = row_count;
  return released_count > 0;
end;
$$;

-- Admin activation now allocates a licence before the guarded status update, or requires
-- another valid entitlement. The whole function remains transactional.
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
  caller_workspace public.admin_workspace := 'normal';
  existing public.student_profiles%rowtype;
  result public.student_profiles;
  selected_pool uuid;
  existing_assignment uuid;
  required_workspace public.admin_workspace := 'normal';
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

create or replace function public.admin_grant_student_entitlement(
  p_student_user_id uuid,
  p_workspace public.admin_workspace,
  p_valid_until timestamptz,
  p_reason text
)
returns public.student_entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  student public.student_profiles%rowtype;
  result public.student_entitlements;
begin
  if not private.is_super_admin() then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;
  if nullif(btrim(p_reason), '') is null then
    raise exception 'An explicit entitlement reason is required' using errcode = '22023';
  end if;
  if p_valid_until is not null and p_valid_until <= now() then
    raise exception 'Entitlement expiry must be in the future' using errcode = '22023';
  end if;

  select * into student from public.student_profiles where user_id = p_student_user_id;
  if student.user_id is null then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;

  insert into public.student_entitlements (
    student_user_id, workspace, source_type, status, valid_until, granted_by, grant_reason
  ) values (
    p_student_user_id, p_workspace, 'admin_grant', 'active', p_valid_until, (select auth.uid()), btrim(p_reason)
  ) returning * into result;

  perform private.log_admin_action(
    'student.entitlement_granted', 'student_entitlement', result.id::text, student.school_id,
    null, to_jsonb(result), p_reason
  );
  return result;
end;
$$;

-- Free Education approval links by the authenticated student profile email, grants a Normal
-- entitlement, and activates eligible students without creating or implying a payment.
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
  student public.student_profiles%rowtype;
  student_before jsonb;
  entitlement public.student_entitlements%rowtype;
begin
  if not private.is_super_admin() then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;
  if p_status = 'pending' then
    raise exception 'A review must choose an outcome' using errcode = '22023';
  end if;

  select * into existing
  from public.free_education_requests
  where id = p_request_id
  for update;
  if existing.id is null then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;

  if p_status = 'approved' then
    select s.* into student
    from public.student_profiles s
    join public.profiles p on p.user_id = s.user_id
    where p.role = 'student'
      and p.is_enabled = true
      and (
        s.user_id = existing.applicant_user_id
        or (existing.applicant_user_id is null and lower(s.email) = lower(existing.email))
      )
    order by (s.user_id = existing.applicant_user_id) desc
    limit 1
    for update of s;

    if student.user_id is null then
      raise exception 'The applicant must complete Student OTP login and profile creation before approval'
        using errcode = '23514';
    end if;
    if student.status in ('suspended', 'banned') then
      raise exception 'Suspended or banned students cannot be activated through Free Education'
        using errcode = '23514';
    end if;
    student_before := to_jsonb(student);

    update public.free_education_requests
    set applicant_user_id = student.user_id,
        school_id = coalesce(existing.school_id, student.school_id),
        status = 'approved',
        reviewer_notes = nullif(btrim(p_notes), ''),
        reviewed_by = (select auth.uid()),
        reviewed_at = now()
    where id = p_request_id
    returning * into result;

    insert into public.student_entitlements (
      student_user_id, workspace, source_type, free_education_request_id,
      status, valid_from, valid_until, granted_by, grant_reason
    ) values (
      student.user_id, 'normal', 'free_education', p_request_id,
      'active', now(), null, (select auth.uid()),
      coalesce(nullif(btrim(p_notes), ''), 'Approved Free Education request')
    )
    on conflict (free_education_request_id) do update set
      student_user_id = excluded.student_user_id,
      workspace = 'normal',
      status = 'active',
      valid_from = now(),
      valid_until = null,
      granted_by = excluded.granted_by,
      grant_reason = excluded.grant_reason,
      revoked_at = null,
      updated_at = now()
    returning * into entitlement;

    if student.status = 'created_draft' then
      update public.student_profiles
      set status = 'pending_verification', status_reason = 'Free Education profile verified'
      where user_id = student.user_id;
      select * into student from public.student_profiles where user_id = student.user_id;
    end if;

    if student.status in ('pending_verification', 'pending_payment', 'expired') then
      update public.student_profiles
      set status = 'pending_activation', status_reason = 'Free Education approved'
      where user_id = student.user_id;
      select * into student from public.student_profiles where user_id = student.user_id;
    end if;

    if student.status = 'pending_activation' then
      update public.student_profiles
      set status = 'active_normal', status_reason = 'Free Education approved', expires_at = null
      where user_id = student.user_id
      returning * into student;
    end if;

    perform private.log_admin_action(
      'student.entitlement_granted', 'student_entitlement', entitlement.id::text, student.school_id,
      null, to_jsonb(entitlement), p_notes
    );
    if student_before is distinct from to_jsonb(student) then
      perform private.log_admin_action(
        'free_education.student_activated', 'student', student.user_id::text, student.school_id,
        student_before, to_jsonb(student), p_notes
      );
    end if;
  else
    update public.free_education_requests
    set status = p_status,
        reviewer_notes = nullif(btrim(p_notes), ''),
        reviewed_by = (select auth.uid()),
        reviewed_at = now()
    where id = p_request_id
    returning * into result;

    update public.student_entitlements
    set status = 'revoked', revoked_at = now()
    where free_education_request_id = p_request_id
      and status = 'active'
    returning * into entitlement;

    if existing.applicant_user_id is not null then
      select * into student
      from public.student_profiles
      where user_id = existing.applicant_user_id
      for update;

      if student.status in ('active_normal', 'active_advanced')
        and not private.has_valid_student_entitlement(
          student.user_id,
          case when student.status = 'active_advanced' then 'advanced'::public.admin_workspace else 'normal'::public.admin_workspace end,
          true
        ) then
        student_before := to_jsonb(student);
        update public.student_profiles
        set status = 'expired', status_reason = 'Free Education entitlement revoked'
        where user_id = student.user_id
        returning * into student;
        perform private.log_admin_action(
          'free_education.student_expired', 'student', student.user_id::text, student.school_id,
          student_before, to_jsonb(student), p_notes
        );
      end if;
    end if;
  end if;

  perform private.log_admin_action(
    'free_education.reviewed', 'free_education_request', p_request_id::text, result.school_id,
    to_jsonb(existing), to_jsonb(result), p_notes
  );
  return result;
end;
$$;

-- Do not expose unapproved demo lessons. Keep the records for later curation.
update public.kb_lessons l
set is_published = false, updated_at = now()
from public.kb_topics t
join public.kb_chapters c on c.id = t.chapter_id
where l.topic_id = t.id
  and c.code like 'phase1-%'
  and l.approved_at is null;

update public.kb_topics t
set is_published = false, updated_at = now()
from public.kb_chapters c
where t.chapter_id = c.id
  and c.code like 'phase1-%';

update public.kb_chapters
set is_published = false, updated_at = now()
where code like 'phase1-%';

-- Explicit function privileges for the new public APIs; private helpers remain internal.
revoke all on function public.release_current_device_session() from public, anon, authenticated;
grant execute on function public.release_current_device_session() to authenticated;
revoke all on function public.admin_grant_student_entitlement(uuid, public.admin_workspace, timestamptz, text)
from public, anon, authenticated;
grant execute on function public.admin_grant_student_entitlement(uuid, public.admin_workspace, timestamptz, text)
to authenticated;

grant execute on function public.submit_student_profile(text, text, date, text, text, text, text, text, text, text, text)
to authenticated;
grant execute on function public.school_create_student_invite(text, text, date, text, text, text, text, text, text, uuid)
to authenticated;
grant execute on function public.school_create_bulk_import(text, text, jsonb) to authenticated;
grant execute on function public.admin_set_student_status(uuid, public.student_status, text) to authenticated;
grant execute on function public.admin_review_free_education(uuid, public.request_status, text) to authenticated;
grant execute on function private.can_access_learning(text) to authenticated;
