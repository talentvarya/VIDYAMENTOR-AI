-- Configuration/reference data only. No demo identities or cross-tenant student data.

insert into public.pricing_plans (
  code, name, audience, workspace, currency, amount_minor, billing_period, features, display_order
)
values
  ('class-9-monthly', 'Class 9', 'student', 'normal', 'INR', 8900, 'monthly',
    '["Class 9 syllabus", "Dual-language AI tutor", "Notes and chapter tests"]'::jsonb, 10),
  ('class-9-annual', 'Class 9', 'student', 'normal', 'INR', 69900, 'annual',
    '["Class 9 syllabus", "Dual-language AI tutor", "Notes and chapter tests"]'::jsonb, 11),
  ('class-10-monthly', 'Class 10', 'student', 'normal', 'INR', 9900, 'monthly',
    '["Class 10 board preparation", "Dual-language AI tutor", "Mock tests"]'::jsonb, 20),
  ('class-10-annual', 'Class 10', 'student', 'normal', 'INR', 79900, 'annual',
    '["Class 10 board preparation", "Dual-language AI tutor", "Mock tests"]'::jsonb, 21),
  ('class-9-10-combo-monthly', 'Class 9 + 10 Combo', 'student', 'normal', 'INR', 9900, 'monthly',
    '["Classes 9 and 10", "Dual-language AI tutor", "Continuous progress tracking"]'::jsonb, 30),
  ('class-9-10-combo-annual', 'Class 9 + 10 Combo', 'student', 'normal', 'INR', 139900, 'annual',
    '["Classes 9 and 10", "Dual-language AI tutor", "Continuous progress tracking"]'::jsonb, 31),
  ('class-11-monthly', 'Class 11', 'student', 'normal', 'INR', 13900, 'monthly',
    '["Science and Commerce streams", "Step-by-step numericals", "Daily practice"]'::jsonb, 40),
  ('class-11-annual', 'Class 11', 'student', 'normal', 'INR', 89900, 'annual',
    '["Science and Commerce streams", "Step-by-step numericals", "Daily practice"]'::jsonb, 41),
  ('class-12-monthly', 'Class 12', 'student', 'normal', 'INR', 14900, 'monthly',
    '["Class 12 board syllabus", "Advanced chapter tests", "Weak-topic plans"]'::jsonb, 50),
  ('class-12-annual', 'Class 12', 'student', 'normal', 'INR', 119900, 'annual',
    '["Class 12 board syllabus", "Advanced chapter tests", "Weak-topic plans"]'::jsonb, 51),
  ('class-11-12-combo-monthly', 'Class 11 + 12 Combo', 'student', 'normal', 'INR', 14900, 'monthly',
    '["Classes 11 and 12", "Science and Commerce subjects", "Full mock series"]'::jsonb, 60),
  ('class-11-12-combo-annual', 'Class 11 + 12 Combo', 'student', 'normal', 'INR', 189900, 'annual',
    '["Classes 11 and 12", "Science and Commerce subjects", "Full mock series"]'::jsonb, 61)
on conflict (code) do update set
  name = excluded.name,
  audience = excluded.audience,
  workspace = excluded.workspace,
  currency = excluded.currency,
  amount_minor = excluded.amount_minor,
  billing_period = excluded.billing_period,
  features = excluded.features,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.kb_boards (code, name)
values
  ('CBSE', 'Central Board of Secondary Education'),
  ('ICSE', 'Indian Certificate of Secondary Education'),
  ('STATE', 'State Board')
on conflict (lower(code)) do nothing;

insert into public.kb_academic_years (board_id, label, starts_on, ends_on)
select b.id, '2026-27', date '2026-04-01', date '2027-03-31'
from public.kb_boards b
where b.code in ('CBSE', 'ICSE', 'STATE')
on conflict (board_id, label) do nothing;

insert into public.kb_classes (academic_year_id, code, name, sort_order)
select y.id, c.code, c.name, c.sort_order
from public.kb_academic_years y
cross join (
  values
    ('6', 'Class 6', 6), ('7', 'Class 7', 7), ('8', 'Class 8', 8),
    ('9', 'Class 9', 9), ('10', 'Class 10', 10), ('11', 'Class 11', 11), ('12', 'Class 12', 12)
) as c(code, name, sort_order)
where y.label = '2026-27'
on conflict (academic_year_id, code) do nothing;

insert into public.kb_subjects (class_id, code, name)
select c.id, s.code, s.name
from public.kb_classes c
cross join (
  values
    ('MATHEMATICS', 'Mathematics'),
    ('SCIENCE', 'Science'),
    ('SOCIAL_SCIENCE', 'Social Science'),
    ('ENGLISH', 'English')
) as s(code, name)
on conflict (class_id, code) do nothing;

-- A small approved starter set keeps the active-student cockpit functional while
-- the full curriculum is curated through the KB workflow. It is never bundled in frontend code.
insert into public.kb_chapters (
  subject_id, code, title, description, duration_minutes, objectives, sort_order, is_published
)
select
  s.id,
  lesson.code,
  lesson.title,
  lesson.description,
  35,
  lesson.objectives::jsonb,
  10,
  true
from public.kb_subjects s
join public.kb_classes c on c.id = s.class_id
join public.kb_academic_years y on y.id = c.academic_year_id
join public.kb_boards b on b.id = y.board_id
join (
  values
    ('9', 'phase1-number-systems', 'Number Systems', 'Build fluency with real numbers and their representations.', '["Classify real numbers", "Use exponent laws", "Represent numbers on the number line"]'),
    ('10', 'phase1-real-numbers', 'Real Numbers', 'Use the fundamental theorem of arithmetic and Euclid’s method.', '["Apply Euclid’s division lemma", "Find HCF and LCM", "Reason about decimal expansions"]'),
    ('11', 'phase1-sets', 'Sets', 'Understand set notation, operations and Venn-diagram reasoning.', '["Represent sets", "Apply union and intersection", "Solve Venn-diagram problems"]'),
    ('12', 'phase1-relations-functions', 'Relations and Functions', 'Connect relations, mappings and functions using domain and range.', '["Classify relations", "Identify functions", "Find domain and range"]')
) as lesson(class_code, code, title, description, objectives) on lesson.class_code = c.code
where b.code = 'CBSE' and y.label = '2026-27' and s.code = 'MATHEMATICS'
on conflict (subject_id, code) do update set
  title = excluded.title,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  objectives = excluded.objectives,
  is_published = true,
  updated_at = now();

insert into public.kb_topics (chapter_id, code, title, sort_order, is_published)
select c.id, 'core-concepts', 'Core Concepts', 10, true
from public.kb_chapters c
where c.code like 'phase1-%'
on conflict (chapter_id, code) do update set is_published = true, updated_at = now();

insert into public.kb_lessons (topic_id, code, title, summary, content, difficulty, sort_order, is_published)
select
  t.id,
  'guided-introduction',
  'Guided introduction',
  'A syllabus-aligned introduction with a worked-example study path.',
  jsonb_build_object(
    'sections', jsonb_build_array(
      jsonb_build_object('type', 'concept', 'title', 'Start with the definition'),
      jsonb_build_object('type', 'example', 'title', 'Follow one worked example'),
      jsonb_build_object('type', 'check', 'title', 'Complete a short self-check')
    )
  ),
  'normal',
  10,
  true
from public.kb_topics t
join public.kb_chapters c on c.id = t.chapter_id
where c.code like 'phase1-%' and t.code = 'core-concepts'
on conflict (topic_id, code) do update set is_published = true, updated_at = now();
