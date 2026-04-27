-- ====================================================================
-- lifeOS — listas customizaveis + capa de livro
-- Cole no Supabase SQL Editor depois de rodar o 0001_initial.sql.
-- Re-rodar e seguro.
-- ====================================================================

-- Capa de livro (OpenLibrary)
alter table public.books add column if not exists cover_url text;

-- Modelo de board (lista customizada)
do $$ begin
  create type public.board_model as enum ('CHECKLIST','CATALOG','COUNTER','SCHEDULE','NOTE');
exception when duplicate_object then null; end $$;

-- Tabela boards (listas criadas pelo usuario)
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  model public.board_model not null,
  icon text default 'List',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_boards_touch on public.boards;
create trigger trg_boards_touch before update on public.boards
  for each row execute function public.touch_updated_at();
create index if not exists ix_boards_user_sort on public.boards(user_id, sort_order);

-- Itens de uma board (forma generica suportando todos os modelos)
create table if not exists public.board_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  description text,
  amount int,                         -- para COUNTER (ml, paginas, ...)
  status text,                        -- para CATALOG (TO_DO, DOING, DONE, ...)
  occurred_at timestamptz,            -- para SCHEDULE / COUNTER
  completed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_board_items_touch on public.board_items;
create trigger trg_board_items_touch before update on public.board_items
  for each row execute function public.touch_updated_at();
create index if not exists ix_board_items_board on public.board_items(board_id, sort_order);

-- Logs diarios para CHECKLIST (igual tarefas)
create table if not exists public.board_item_logs (
  id uuid primary key default gen_random_uuid(),
  board_item_id uuid not null references public.board_items(id) on delete cascade,
  occurred_on date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (board_item_id, occurred_on)
);
create index if not exists ix_board_item_logs_date on public.board_item_logs(board_item_id, occurred_on);

-- RLS
alter table public.boards enable row level security;
alter table public.board_items enable row level security;
alter table public.board_item_logs enable row level security;

drop policy if exists boards_owner on public.boards;
create policy boards_owner on public.boards for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists board_items_owner on public.board_items;
create policy board_items_owner on public.board_items for all to authenticated
  using (exists (select 1 from public.boards b where b.id = board_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.boards b where b.id = board_id and b.user_id = auth.uid()));

drop policy if exists board_item_logs_owner on public.board_item_logs;
create policy board_item_logs_owner on public.board_item_logs for all to authenticated
  using (exists (
    select 1 from public.board_items i
    join public.boards b on b.id = i.board_id
    where i.id = board_item_id and b.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.board_items i
    join public.boards b on b.id = i.board_id
    where i.id = board_item_id and b.user_id = auth.uid()
  ));
