-- ====================================================================
-- lifeOS — treinos v2
-- - permite multiplos grupos no mesmo dia da semana
-- - adiciona series, repeticoes e carga em workout_exercises
-- Re-rodar e seguro.
-- ====================================================================

-- 1) remove unique (workout_plan_id, week_day) para permitir multiplos grupos no mesmo dia
do $$
declare cname text;
begin
  select tc.constraint_name into cname
  from information_schema.table_constraints tc
  where tc.table_schema = 'public'
    and tc.table_name = 'workout_days'
    and tc.constraint_type = 'UNIQUE';
  if cname is not null then
    execute format('alter table public.workout_days drop constraint %I', cname);
  end if;
end $$;

-- 2) campos de prescricao por exercicio
alter table public.workout_exercises
  add column if not exists sets int,
  add column if not exists reps text,
  add column if not exists load text;
