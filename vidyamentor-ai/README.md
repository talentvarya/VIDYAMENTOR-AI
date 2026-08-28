# VIDYAMENTOR AI

Phase 1 is a Vite/React application backed by Supabase Auth and PostgreSQL. The original public landing-page design is preserved; authentication, activation gates and administrative workspaces are database-backed.

## Implemented Phase 1 backend

- Email OTP authentication through Supabase Auth (no application passwords)
- Database-owned `student`, `school_admin` and `super_admin` roles
- RLS on every exposed table with school tenant isolation
- Full student profile and age-20 Normal Phase validation in PostgreSQL
- Student lifecycle and validated status transitions
- Zero LMS/AI/course/test/note/community data access until `active_normal` or `active_advanced`
- One active Supabase auth session/device, including “Logout Other Device & Continue”
- School Admin student creation, CSV/XLSX import and licence pool reporting
- Super Admin approval queues, Normal/Advanced selector, Free Education review and audit history
- Database pricing with the public pricing cards using active database values
- Foundations for subscriptions, payments, invoices, promo codes and school contracts
- Board → Academic Year → Class → Subject → Chapter → Topic → Lesson knowledge model
- Approved source/document/chunk/vector metadata for later RAG
- AI usage, violations, strikes, appeals, tickets and notifications
- Server-side persistence for Free Education and school enquiries
- Server-verified AI Tutor access; live Gemini calls remain disabled until a server key is configured

## Local setup

Requirements: Node.js 22+, npm, and optionally Docker Desktop for the local Supabase stack.

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and add the project’s publishable and server-only keys.
3. Apply migrations to a linked project:

   ```sh
   npx supabase login
   npx supabase link --project-ref dlptluzkfoofxnyiydwk
   npx supabase db push
   npx supabase config push
   ```

4. In Supabase Auth email templates, ensure the Magic Link template contains `{{ .Token }}`. The repository template is `supabase/templates/otp.html`. Configure custom SMTP before production OTP traffic.
5. Run `npm run dev`. Use `npx vercel dev` to exercise Vercel API functions locally.

There is no demo OTP or frontend admin credential fallback. Without the Supabase configuration the landing page still renders, but secure sign-in reports a configuration error.

## Initial platform configuration

After the first admin has authenticated once, assign the Super Admin role using a privileged SQL session. Roles are never read from user-editable auth metadata:

```sql
update public.profiles
set role = 'super_admin', school_id = null
where lower(email) = lower('owner@example.com');
```

Create a school, then assign its administrator with a protected SQL/admin operation:

```sql
insert into public.schools (name, code, board)
values ('Example School', 'EXAMPLE-001', 'CBSE');

update public.profiles p
set role = 'school_admin',
    school_id = (select id from public.schools where code = 'EXAMPLE-001')
where lower(p.email) = lower('school-admin@example.com');
```

Create a valid `school_license_pools` record before a School Admin activates students. Activation fails closed when no licence is available.

## Environment variables

Browser-safe:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only:

- `SUPABASE_URL` (optional server alias; falls back to `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_PUBLISHABLE_KEY` (optional server alias; falls back to the public key above)
- `SUPABASE_SERVICE_ROLE_KEY` — never use a `VITE_` prefix

Optional existing integrations:

- `GEMINI_API_KEY`, `GEMINI_MODEL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_TO_EMAIL`

## Verification and deployment

- `npm run typecheck`
- `npm run build`
- `npx supabase db lint --linked --level warning`

Set the Vercel project root to `vidyamentor-ai`. Vercel uses Node 22 and `npm run build`. The protected SPA routes `/dashboard`, `/school-admin` and `/super-admin` are rewritten to the application shell; database/API authorization remains server-side.
