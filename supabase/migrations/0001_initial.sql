-- ====================================================================
-- lst — schema inicial (Supabase / Postgres)
-- Cole ESTE bloco inteiro no Supabase: Dashboard -> SQL Editor -> New query
-- Re-rodar é seguro (idempotente).
-- ====================================================================

-- ---------- Enums ----------
do $$ begin create type public.task_status as enum ('ACTIVE','ARCHIVED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.book_status as enum ('TO_READ','READING','FINISHED','ABANDONED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.movie_status as enum ('TO_WATCH','WATCHING','WATCHED','ABANDONED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.appointment_status as enum ('SCHEDULED','DONE','CANCELED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reminder_status as enum ('PENDING','DONE','CANCELED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.priority_level as enum ('LOW','MEDIUM','HIGH'); exception when duplicate_object then null; end $$;
do $$ begin create type public.medication_frequency as enum ('DAILY','WEEKLY','CUSTOM','AS_NEEDED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.exam_status as enum ('PLANNED','SCHEDULED','DONE','REVIEWED'); exception when duplicate_object then null; end $$;

-- ---------- Helper: touch updated_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  timezone text not null default 'America/Recife',
  daily_water_goal_ml int default 2500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------- water_goals ----------
create table if not exists public.water_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_goal_ml int not null default 2500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_water_goals_touch on public.water_goals;
create trigger trg_water_goals_touch before update on public.water_goals
  for each row execute function public.touch_updated_at();

-- ---------- water_logs ----------
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml int not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists ix_water_logs_user_time on public.water_logs(user_id, occurred_at);

-- ---------- tasks ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  is_recurring boolean not null default false,
  recurrence_rule text,
  status public.task_status not null default 'ACTIVE',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_tasks_touch on public.tasks;
create trigger trg_tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();
create index if not exists ix_tasks_user_status on public.tasks(user_id, status);

-- ---------- task_logs ----------
create table if not exists public.task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  occurred_on date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (task_id, occurred_on)
);
create index if not exists ix_task_logs_user_date on public.task_logs(user_id, occurred_on);

-- ---------- workout_plans ----------
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_workout_plans_touch on public.workout_plans;
create trigger trg_workout_plans_touch before update on public.workout_plans
  for each row execute function public.touch_updated_at();
create index if not exists ix_workout_plans_user_active on public.workout_plans(user_id, is_active);

-- ---------- workout_days ----------
create table if not exists public.workout_days (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references public.workout_plans(id) on delete cascade,
  week_day int not null check (week_day between 0 and 6),
  title text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_plan_id, week_day)
);
drop trigger if exists trg_workout_days_touch on public.workout_days;
create trigger trg_workout_days_touch before update on public.workout_days
  for each row execute function public.touch_updated_at();

-- ---------- workout_exercises ----------
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  name text not null,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_workout_exercises_touch on public.workout_exercises;
create trigger trg_workout_exercises_touch before update on public.workout_exercises
  for each row execute function public.touch_updated_at();

-- ---------- workout_logs ----------
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  occurred_on date not null,
  completed boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (workout_exercise_id, occurred_on)
);
create index if not exists ix_workout_logs_user_date on public.workout_logs(user_id, occurred_on);

-- ---------- meal_plans ----------
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  reference_month int,
  reference_year int,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_meal_plans_touch on public.meal_plans;
create trigger trg_meal_plans_touch before update on public.meal_plans
  for each row execute function public.touch_updated_at();
create index if not exists ix_meal_plans_user_active on public.meal_plans(user_id, is_active);

-- ---------- meal_sections ----------
create table if not exists public.meal_sections (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_meal_sections_touch on public.meal_sections;
create trigger trg_meal_sections_touch before update on public.meal_sections
  for each row execute function public.touch_updated_at();

-- ---------- meal_items ----------
create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_section_id uuid not null references public.meal_sections(id) on delete cascade,
  description text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_meal_items_touch on public.meal_items;
create trigger trg_meal_items_touch before update on public.meal_items
  for each row execute function public.touch_updated_at();

-- ---------- meal_logs ----------
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_section_id uuid not null references public.meal_sections(id) on delete cascade,
  occurred_on date not null,
  completed boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (meal_section_id, occurred_on)
);
create index if not exists ix_meal_logs_user_date on public.meal_logs(user_id, occurred_on);

-- ---------- books ----------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  year_bucket int,
  current_page int,
  total_pages int,
  rating int,
  status public.book_status not null default 'TO_READ',
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_books_touch on public.books;
create trigger trg_books_touch before update on public.books
  for each row execute function public.touch_updated_at();
create index if not exists ix_books_user_status on public.books(user_id, status);

-- ---------- book_logs ----------
create table if not exists public.book_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status public.book_status not null,
  current_page int,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists ix_book_logs_user_time on public.book_logs(user_id, created_at);

-- ---------- movies ----------
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  genre text,
  release_year int,
  watched_at timestamptz,
  rating int,
  status public.movie_status not null default 'TO_WATCH',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_movies_touch on public.movies;
create trigger trg_movies_touch before update on public.movies
  for each row execute function public.touch_updated_at();
create index if not exists ix_movies_user_status on public.movies(user_id, status);

-- ---------- movie_logs ----------
create table if not exists public.movie_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  status public.movie_status not null,
  rating int,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists ix_movie_logs_user_time on public.movie_logs(user_id, created_at);

-- ---------- appointments ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  meeting_url text,
  status public.appointment_status not null default 'SCHEDULED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_appointments_touch on public.appointments;
create trigger trg_appointments_touch before update on public.appointments
  for each row execute function public.touch_updated_at();
create index if not exists ix_appointments_user_time on public.appointments(user_id, starts_at);

-- ---------- reminders ----------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  priority public.priority_level not null default 'MEDIUM',
  recurrence_rule text,
  status public.reminder_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_reminders_touch on public.reminders;
create trigger trg_reminders_touch before update on public.reminders
  for each row execute function public.touch_updated_at();
create index if not exists ix_reminders_user_status on public.reminders(user_id, status, due_at);

-- ---------- medications ----------
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dosage text,
  instructions text,
  frequency_type public.medication_frequency not null default 'DAILY',
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_medications_touch on public.medications;
create trigger trg_medications_touch before update on public.medications
  for each row execute function public.touch_updated_at();
create index if not exists ix_medications_user_active on public.medications(user_id, is_active);

-- ---------- medication_schedules ----------
create table if not exists public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  time_label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_medication_schedules_touch on public.medication_schedules;
create trigger trg_medication_schedules_touch before update on public.medication_schedules
  for each row execute function public.touch_updated_at();

-- ---------- medication_logs ----------
create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  medication_schedule_id uuid references public.medication_schedules(id) on delete set null,
  occurred_at timestamptz not null,
  taken boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists ix_medication_logs_user_time on public.medication_logs(user_id, occurred_at);

-- ---------- exams ----------
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  notes text,
  recurrence_days int,
  current_status public.exam_status not null default 'PLANNED',
  scheduled_at timestamptz,
  performed_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_exams_touch on public.exams;
create trigger trg_exams_touch before update on public.exams
  for each row execute function public.touch_updated_at();
create index if not exists ix_exams_user_status on public.exams(user_id, current_status);

-- ---------- exam_logs ----------
create table if not exists public.exam_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  status public.exam_status not null,
  notes text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists ix_exam_logs_user_time on public.exam_logs(user_id, occurred_at);

-- ---------- exam_files ----------
create table if not exists public.exam_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  mime_type text,
  created_at timestamptz not null default now()
);
create index if not exists ix_exam_files_user_time on public.exam_files(user_id, created_at);

-- ====================================================================
-- Trigger: cria profile + meta de agua quando alguem se cadastra
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_full_name text := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(coalesce(new.email,''), '@', 1),
    'Usuario'
  );
begin
  insert into public.profiles (user_id, full_name, daily_water_goal_ml)
  values (new.id, v_full_name, 2500)
  on conflict (user_id) do nothing;

  insert into public.water_goals (user_id, daily_goal_ml)
  values (new.id, 2500)
  on conflict (user_id) do nothing;

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ====================================================================
-- RLS — habilitar e isolar por usuario
-- ====================================================================
alter table public.profiles            enable row level security;
alter table public.water_goals         enable row level security;
alter table public.water_logs          enable row level security;
alter table public.tasks               enable row level security;
alter table public.task_logs           enable row level security;
alter table public.workout_plans       enable row level security;
alter table public.workout_days        enable row level security;
alter table public.workout_exercises   enable row level security;
alter table public.workout_logs        enable row level security;
alter table public.meal_plans          enable row level security;
alter table public.meal_sections       enable row level security;
alter table public.meal_items          enable row level security;
alter table public.meal_logs           enable row level security;
alter table public.books               enable row level security;
alter table public.book_logs           enable row level security;
alter table public.movies              enable row level security;
alter table public.movie_logs          enable row level security;
alter table public.appointments        enable row level security;
alter table public.reminders           enable row level security;
alter table public.medications         enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medication_logs     enable row level security;
alter table public.exams               enable row level security;
alter table public.exam_logs           enable row level security;
alter table public.exam_files          enable row level security;

-- Policies "owner" para tabelas com user_id direto
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'profiles','water_goals','water_logs','tasks','task_logs',
      'workout_plans','workout_logs','meal_plans','meal_logs',
      'books','book_logs','movies','movie_logs',
      'appointments','reminders','medications','medication_logs',
      'exams','exam_logs','exam_files'
    ])
  loop
    execute format('drop policy if exists %I on public.%I;', t || '_owner', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t || '_owner', t
    );
  end loop;
end $$;

-- Policies para tabelas filhas (acesso via parent.user_id)
drop policy if exists workout_days_owner on public.workout_days;
create policy workout_days_owner on public.workout_days for all to authenticated
  using (exists (select 1 from public.workout_plans p where p.id = workout_plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_plans p where p.id = workout_plan_id and p.user_id = auth.uid()));

drop policy if exists workout_exercises_owner on public.workout_exercises;
create policy workout_exercises_owner on public.workout_exercises for all to authenticated
  using (exists (
    select 1 from public.workout_days d
    join public.workout_plans p on p.id = d.workout_plan_id
    where d.id = workout_day_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workout_days d
    join public.workout_plans p on p.id = d.workout_plan_id
    where d.id = workout_day_id and p.user_id = auth.uid()
  ));

drop policy if exists meal_sections_owner on public.meal_sections;
create policy meal_sections_owner on public.meal_sections for all to authenticated
  using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and p.user_id = auth.uid()));

drop policy if exists meal_items_owner on public.meal_items;
create policy meal_items_owner on public.meal_items for all to authenticated
  using (exists (
    select 1 from public.meal_sections s
    join public.meal_plans p on p.id = s.meal_plan_id
    where s.id = meal_section_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.meal_sections s
    join public.meal_plans p on p.id = s.meal_plan_id
    where s.id = meal_section_id and p.user_id = auth.uid()
  ));

drop policy if exists medication_schedules_owner on public.medication_schedules;
create policy medication_schedules_owner on public.medication_schedules for all to authenticated
  using (exists (select 1 from public.medications m where m.id = medication_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.medications m where m.id = medication_id and m.user_id = auth.uid()));

-- Fim
