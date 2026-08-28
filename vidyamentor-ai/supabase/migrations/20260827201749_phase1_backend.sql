-- VIDYAMENTOR AI Phase 1: multi-tenant data model.
-- Authorization policies and workflow functions are installed by the next migration.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon;

create type public.app_role as enum ('student', 'school_admin', 'super_admin');
create type public.student_status as enum (
  'created_draft',
  'pending_verification',
  'pending_payment',
  'pending_activation',
  'active_normal',
  'active_advanced',
  'suspended',
  'banned',
  'expired'
);
create type public.admin_workspace as enum ('normal', 'advanced');
create type public.request_status as enum ('pending', 'approved', 'rejected', 'more_info_requested');
create type public.import_status as enum ('uploaded', 'validating', 'ready', 'processing', 'completed', 'completed_with_errors', 'failed');
create type public.import_row_status as enum ('pending', 'valid', 'invalid', 'created', 'failed');
create type public.subscription_status as enum ('pending', 'active', 'past_due', 'cancelled', 'expired');
create type public.payment_status as enum ('created', 'pending', 'paid', 'failed', 'refunded');
create type public.invoice_status as enum ('draft', 'issued', 'paid', 'void', 'overdue');
create type public.contract_status as enum ('draft', 'sent', 'signed', 'active', 'expired', 'terminated');
create type public.ticket_status as enum ('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed');
create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.violation_status as enum ('open', 'confirmed', 'dismissed', 'appealed', 'resolved');
create type public.appeal_status as enum ('pending', 'approved', 'rejected');
create type public.notification_channel as enum ('in_app', 'email', 'sms', 'push');

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  board text,
  status text not null default 'active' check (status in ('active', 'suspended', 'closed')),
  contact_name text,
  contact_email text,
  contact_phone text,
  address jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schools_name_not_blank check (length(btrim(name)) > 0),
  constraint schools_code_format check (code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$')
);
create unique index schools_code_unique on public.schools (lower(code));

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  school_id uuid references public.schools(id) on delete restrict,
  display_name text,
  email text not null,
  is_enabled boolean not null default true,
  preferred_workspace public.admin_workspace not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_school check (
    (role = 'super_admin' and school_id is null)
    or (role = 'school_admin' and school_id is not null)
    or role = 'student'
  )
);
create unique index profiles_email_unique on public.profiles (lower(email));
create index profiles_school_role_idx on public.profiles (school_id, role);

create table public.student_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete restrict,
  full_name text not null,
  email text not null,
  date_of_birth date not null,
  class_level text not null,
  board text not null,
  student_id text not null,
  school_name text not null,
  section text,
  language_1 text not null,
  language_2 text,
  status public.student_status not null default 'created_draft',
  status_reason text,
  verified_at timestamptz,
  paid_at timestamptz,
  activated_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profiles_name_not_blank check (length(btrim(full_name)) > 0),
  constraint student_profiles_id_not_blank check (length(btrim(student_id)) > 0),
  constraint student_profiles_languages_distinct check (language_2 is null or lower(language_1) <> lower(language_2))
);
create unique index student_profiles_email_unique on public.student_profiles (lower(email));
create unique index student_profiles_school_student_id_unique on public.student_profiles (school_id, lower(student_id)) where school_id is not null;
create index student_profiles_school_status_idx on public.student_profiles (school_id, status);
create index student_profiles_status_idx on public.student_profiles (status);

create table public.student_invites (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  email text not null,
  full_name text not null,
  date_of_birth date not null,
  class_level text not null,
  board text not null,
  student_id text not null,
  section text,
  language_1 text not null,
  language_2 text,
  invited_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_invites_languages_distinct check (language_2 is null or lower(language_1) <> lower(language_2))
);
create unique index student_invites_open_email_unique on public.student_invites (school_id, lower(email)) where claimed_at is null;
create unique index student_invites_open_student_id_unique on public.student_invites (school_id, lower(student_id)) where claimed_at is null;
create index student_invites_school_created_idx on public.student_invites (school_id, created_at desc);

create table public.student_status_history (
  id bigint generated always as identity primary key,
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete restrict,
  from_status public.student_status,
  to_status public.student_status not null,
  reason text,
  changed_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index student_status_history_student_idx on public.student_status_history (student_user_id, created_at desc);
create index student_status_history_school_idx on public.student_status_history (school_id, created_at desc);

create table public.user_device_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  auth_session_id uuid not null,
  device_id text not null,
  device_name text,
  user_agent text,
  ip_hash text,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz not null default now(),
  constraint user_device_sessions_device_not_blank check (length(btrim(device_id)) between 8 and 200)
);
create unique index user_device_sessions_one_active_per_user on public.user_device_sessions (user_id) where revoked_at is null;
create unique index user_device_sessions_one_active_auth_session on public.user_device_sessions (auth_session_id) where revoked_at is null;
create index user_device_sessions_user_recent_idx on public.user_device_sessions (user_id, last_seen_at desc);

create table public.bulk_student_imports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  source_format text not null check (source_format in ('csv', 'xlsx')),
  original_filename text not null,
  status public.import_status not null default 'uploaded',
  total_rows integer not null default 0 check (total_rows >= 0),
  valid_rows integer not null default 0 check (valid_rows >= 0),
  invalid_rows integer not null default 0 check (invalid_rows >= 0),
  created_rows integer not null default 0 check (created_rows >= 0),
  error_summary jsonb not null default '[]'::jsonb,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bulk_student_imports_school_idx on public.bulk_student_imports (school_id, created_at desc);

create table public.bulk_student_import_rows (
  id bigint generated always as identity primary key,
  import_id uuid not null references public.bulk_student_imports(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  raw_data jsonb not null,
  normalized_data jsonb,
  status public.import_row_status not null default 'pending',
  validation_errors jsonb not null default '[]'::jsonb,
  student_invite_id uuid references public.student_invites(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint bulk_student_import_rows_unique_row unique (import_id, row_number)
);
create index bulk_student_import_rows_import_status_idx on public.bulk_student_import_rows (import_id, status);

create table public.school_license_pools (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  workspace public.admin_workspace not null default 'normal',
  purchased_quantity integer not null check (purchased_quantity >= 0),
  valid_from date not null,
  valid_until date not null,
  contract_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_license_pools_dates check (valid_until >= valid_from)
);
create index school_license_pools_school_dates_idx on public.school_license_pools (school_id, valid_until desc);

create table public.school_license_assignments (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.school_license_pools(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  assigned_by uuid references public.profiles(user_id) on delete set null,
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  release_reason text
);
create unique index school_license_assignments_active_student on public.school_license_assignments (student_user_id) where released_at is null;
create index school_license_assignments_pool_active_idx on public.school_license_assignments (pool_id, released_at);
create index school_license_assignments_school_idx on public.school_license_assignments (school_id, assigned_at desc);

create table public.free_education_requests (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid references public.profiles(user_id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  class_level text,
  board text,
  school_name text,
  reason text not null,
  supporting_documents jsonb not null default '[]'::jsonb,
  status public.request_status not null default 'pending',
  reviewer_notes text,
  reviewed_by uuid references public.profiles(user_id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index free_education_requests_status_idx on public.free_education_requests (status, created_at);
create index free_education_requests_school_idx on public.free_education_requests (school_id, created_at desc);

create table public.school_enquiries (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  city text,
  student_count integer check (student_count is null or student_count >= 0),
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index school_enquiries_status_idx on public.school_enquiries (status, created_at);

create table public.pricing_plans (
  code text primary key,
  name text not null,
  audience text not null check (audience in ('student', 'school')),
  workspace public.admin_workspace not null default 'normal',
  currency char(3) not null default 'INR',
  amount_minor integer not null check (amount_minor >= 0),
  billing_period text not null check (billing_period in ('one_time', 'monthly', 'quarterly', 'annual', 'contract')),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  currency char(3),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promo_codes_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create unique index promo_codes_code_unique on public.promo_codes (lower(code));

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  plan_code text not null references public.pricing_plans(code) on delete restrict,
  status public.subscription_status not null default 'pending',
  current_period_start timestamptz,
  current_period_end timestamptz,
  external_provider text,
  external_subscription_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_owner check ((user_id is not null)::integer + (school_id is not null)::integer = 1)
);
create index subscriptions_user_idx on public.subscriptions (user_id, status);
create index subscriptions_school_idx on public.subscriptions (school_id, status);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  user_id uuid references public.profiles(user_id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  amount_minor integer not null check (amount_minor >= 0),
  currency char(3) not null default 'INR',
  status public.payment_status not null default 'created',
  provider text,
  provider_payment_id text,
  idempotency_key text not null,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index payments_idempotency_key_unique on public.payments (idempotency_key);
create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_school_idx on public.payments (school_id, created_at desc);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  user_id uuid references public.profiles(user_id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  invoice_number text not null,
  status public.invoice_status not null default 'draft',
  subtotal_minor integer not null check (subtotal_minor >= 0),
  tax_minor integer not null default 0 check (tax_minor >= 0),
  total_minor integer not null check (total_minor >= 0),
  currency char(3) not null default 'INR',
  issued_at timestamptz,
  due_at timestamptz,
  line_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_total check (total_minor = subtotal_minor + tax_minor)
);
create unique index invoices_number_unique on public.invoices (invoice_number);
create index invoices_user_idx on public.invoices (user_id, created_at desc);
create index invoices_school_idx on public.invoices (school_id, created_at desc);

create table public.school_contracts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  contract_number text not null,
  status public.contract_status not null default 'draft',
  starts_on date,
  ends_on date,
  total_value_minor integer check (total_value_minor is null or total_value_minor >= 0),
  currency char(3) not null default 'INR',
  terms jsonb not null default '{}'::jsonb,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_contracts_dates check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create unique index school_contracts_number_unique on public.school_contracts (contract_number);
create index school_contracts_school_idx on public.school_contracts (school_id, status);

-- Knowledge Base hierarchy: Board -> Academic Year -> Class -> Subject -> Chapter -> Topic -> Lesson.
create table public.kb_boards (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index kb_boards_code_unique on public.kb_boards (lower(code));

create table public.kb_academic_years (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.kb_boards(id) on delete cascade,
  label text not null,
  starts_on date,
  ends_on date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_academic_years_dates check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint kb_academic_years_unique unique (board_id, label)
);

create table public.kb_classes (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.kb_academic_years(id) on delete cascade,
  code text not null,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_classes_unique unique (academic_year_id, code)
);

create table public.kb_subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.kb_classes(id) on delete cascade,
  code text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_subjects_unique unique (class_id, code)
);

create table public.kb_chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.kb_subjects(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  objectives jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_chapters_unique unique (subject_id, code)
);
create index kb_chapters_subject_published_idx on public.kb_chapters (subject_id, is_published, sort_order);

create table public.kb_topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.kb_chapters(id) on delete cascade,
  code text not null,
  title text not null,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_topics_unique unique (chapter_id, code)
);
create index kb_topics_chapter_published_idx on public.kb_topics (chapter_id, is_published, sort_order);

create table public.kb_lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.kb_topics(id) on delete cascade,
  code text not null,
  title text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  difficulty text not null default 'normal' check (difficulty in ('normal', 'advanced')),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kb_lessons_unique unique (topic_id, code)
);
create index kb_lessons_topic_published_idx on public.kb_lessons (topic_id, is_published, sort_order);

create table public.kb_sources (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references public.kb_boards(id) on delete set null,
  source_type text not null check (source_type in ('textbook', 'curriculum', 'teacher_note', 'web', 'uploaded_document')),
  title text not null,
  publisher text,
  source_url text,
  licence text,
  checksum text,
  metadata jsonb not null default '{}'::jsonb,
  is_approved boolean not null default false,
  approved_by uuid references public.profiles(user_id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index kb_sources_approved_idx on public.kb_sources (is_approved, board_id);

create table public.kb_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.kb_sources(id) on delete cascade,
  lesson_id uuid references public.kb_lessons(id) on delete set null,
  storage_bucket text,
  storage_path text,
  mime_type text,
  original_filename text,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'rejected', 'archived')),
  version integer not null default 1 check (version > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index kb_documents_source_status_idx on public.kb_documents (source_id, status);
create index kb_documents_lesson_idx on public.kb_documents (lesson_id);

create table public.kb_chunks (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.kb_documents(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  token_count integer check (token_count is null or token_count >= 0),
  embedding extensions.vector(768),
  metadata jsonb not null default '{}'::jsonb,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  constraint kb_chunks_unique unique (document_id, chunk_index)
);
create index kb_chunks_document_approved_idx on public.kb_chunks (document_id, is_approved);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references public.kb_boards(id) on delete set null,
  class_code text not null,
  title text not null,
  description text,
  difficulty text not null default 'normal' check (difficulty in ('normal', 'advanced')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_class_published_idx on public.courses (class_code, is_published);

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete restrict,
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  last_lesson_id uuid references public.kb_lessons(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_enrollments_unique unique (course_id, student_user_id)
);
create index course_enrollments_student_idx on public.course_enrollments (student_user_id, updated_at desc);
create index course_enrollments_school_idx on public.course_enrollments (school_id, updated_at desc);

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.kb_lessons(id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  difficulty text not null default 'normal' check (difficulty in ('normal', 'advanced')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tests_lesson_published_idx on public.tests (lesson_id, is_published);

create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete restrict,
  answers jsonb not null default '{}'::jsonb,
  score numeric(6,2),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);
create index test_attempts_student_idx on public.test_attempts (student_user_id, created_at desc);
create index test_attempts_school_idx on public.test_attempts (school_id, created_at desc);

create table public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete restrict,
  lesson_id uuid references public.kb_lessons(id) on delete set null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index student_notes_student_idx on public.student_notes (student_user_id, updated_at desc);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references public.profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  body text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_posts_school_visible_idx on public.community_posts (school_id, is_hidden, created_at desc);

create table public.ai_usage_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(user_id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,
  feature text not null,
  model text,
  request_id text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  success boolean not null default true,
  error_code text,
  safety_labels jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index ai_usage_events_user_idx on public.ai_usage_events (user_id, created_at desc);
create index ai_usage_events_school_idx on public.ai_usage_events (school_id, created_at desc);

create table public.violations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  source_type text not null,
  source_id text,
  category text not null,
  severity smallint not null check (severity between 1 and 5),
  status public.violation_status not null default 'open',
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  reviewed_by uuid references public.profiles(user_id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index violations_user_idx on public.violations (user_id, created_at desc);
create index violations_school_status_idx on public.violations (school_id, status, created_at desc);

create table public.strikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  violation_id uuid not null references public.violations(id) on delete cascade,
  points smallint not null default 1 check (points between 1 and 10),
  reason text not null,
  issued_by uuid references public.profiles(user_id) on delete set null,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index strikes_user_active_idx on public.strikes (user_id, expires_at) where revoked_at is null;

create table public.appeals (
  id uuid primary key default gen_random_uuid(),
  violation_id uuid not null references public.violations(id) on delete cascade,
  appellant_user_id uuid not null references public.profiles(user_id) on delete cascade,
  reason text not null,
  status public.appeal_status not null default 'pending',
  decision_notes text,
  decided_by uuid references public.profiles(user_id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index appeals_one_pending_per_violation on public.appeals (violation_id) where status = 'pending';
create index appeals_appellant_idx on public.appeals (appellant_user_id, created_at desc);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  subject text not null,
  category text not null,
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'normal',
  assigned_to uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_tickets_requester_idx on public.support_tickets (requester_user_id, updated_at desc);
create index support_tickets_school_status_idx on public.support_tickets (school_id, status, updated_at desc);

create table public.support_ticket_messages (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(user_id) on delete cascade,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);
create index support_ticket_messages_ticket_idx on public.support_ticket_messages (ticket_id, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text not null,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

create table public.admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  actor_role public.app_role,
  school_id uuid references public.schools(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  request_id text,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index admin_audit_logs_actor_idx on public.admin_audit_logs (actor_user_id, created_at desc);
create index admin_audit_logs_school_idx on public.admin_audit_logs (school_id, created_at desc);
create index admin_audit_logs_target_idx on public.admin_audit_logs (target_type, target_id, created_at desc);

-- Apply updated_at consistently to mutable records.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'schools', 'profiles', 'student_profiles', 'student_invites', 'bulk_student_imports',
    'school_license_pools', 'free_education_requests', 'school_enquiries', 'pricing_plans',
    'promo_codes', 'subscriptions', 'payments', 'invoices', 'school_contracts',
    'kb_boards', 'kb_academic_years', 'kb_classes', 'kb_subjects', 'kb_chapters',
    'kb_topics', 'kb_lessons', 'kb_sources', 'kb_documents', 'courses',
    'course_enrollments', 'tests', 'student_notes', 'community_posts', 'violations',
    'appeals', 'support_tickets'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function private.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end;
$$;

create view public.school_license_summary
with (security_invoker = true)
as
select
  p.id as pool_id,
  p.school_id,
  p.workspace,
  p.purchased_quantity as purchased,
  count(a.id) filter (where a.released_at is null)::integer as assigned,
  greatest(p.purchased_quantity - count(a.id) filter (where a.released_at is null)::integer, 0) as available,
  p.valid_from,
  p.valid_until
from public.school_license_pools p
left join public.school_license_assignments a on a.pool_id = p.id
group by p.id;
