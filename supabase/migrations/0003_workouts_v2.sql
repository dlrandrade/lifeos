-- ====================================================================
-- lifeOS — treinos v2
-- - permite multiplos grupos no mesmo dia da semana
-- - adiciona series, repeticoes e carga em workout_exercises
-- Idempotente: pode rodar multiplas vezes. Seguro mesmo sem 0001.
-- ====================================================================

-- 1) Remove unique (workout_plan_id, week_day) para multiplos grupos/dia
do $$
declare
  cname text;
begin
  select tc.constraint_name into cname
  from information_schema.table_constraints tc
  join information_schema.constraint_column_usage ccu
    on  ccu.constraint_name = tc.constraint_name
    and ccu.table_schema    = tc.table_schema
  where tc.table_schema    = 'public'
    and tc.table_name      = 'workout_days'
    and tc.constraint_type = 'UNIQUE'
    and ccu.column_name    in ('workout_plan_id', 'week_day')
  limit 1;

  if cname is not null then
    execute format('alter table public.workout_days drop constraint %I', cname);
  end if;
end $$;

-- 2) Adiciona colunas de prescricao em workout_exercises
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'workout_exercises'
  ) then
    raise notice 'workout_exercises nao encontrada; rode 0001_initial.sql primeiro.';
    return;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'workout_exercises' and column_name = 'sets'
  ) then
    alter table public.workout_exercises add column sets int;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'workout_exercises' and column_name = 'reps'
  ) then
    alter table public.workout_exercises add column reps text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'workout_exercises' and column_name = 'load'
  ) then
    alter table public.workout_exercises add column load text;
  end if;
end $$;
