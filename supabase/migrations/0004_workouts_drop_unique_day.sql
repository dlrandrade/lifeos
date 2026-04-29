-- ====================================================================
-- lifeOS — treinos v2 fix
-- Remove unique (workout_plan_id, week_day) pelo nome exato.
-- IF EXISTS: sem erro se ja foi removido antes.
-- ====================================================================
alter table public.workout_days
  drop constraint if exists workout_days_workout_plan_id_week_day_key;
