# lst

Web app pessoal (PWA) para rotina, saude e organizacao com os modulos:

- Dashboard
- Treinos
- Dieta
- Livros
- Filmes
- Hidratacao
- Compromissos
- Lembretes
- Remedios
- Exames

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS 4
- Supabase (Auth + Postgres + PostgREST + RLS)
- PWA: manifest + service worker + offline shell + install prompt

## Como rodar

1. Crie um projeto no [Supabase](https://supabase.com).
2. No Supabase, abra **SQL Editor → New query**, cole o conteudo de
   `supabase/migrations/0001_initial.sql` inteiro e rode. Ele cria tabelas,
   enums, indices, RLS e o trigger que prepara `profiles` + `water_goals`
   quando alguem se cadastra.
3. Crie `.env.local` na raiz com:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. Instale e suba:

   ```bash
   npm install
   npm run dev
   ```

## PWA

- Manifest: `src/app/manifest.ts` (servido em `/manifest.webmanifest`).
- Service worker: `public/sw.js` (registrado por `src/components/pwa-register.tsx`).
- Pagina offline: `src/app/offline/page.tsx`.
- Icones: `public/icons/` (regenere com `npm run pwa:icons`).

## Vercel — variaveis de ambiente

Em **Project → Settings → Environment Variables**:

| Nome                            | Escopo                |
| ------------------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Production + Preview  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Production + Preview  |

> A `SUPABASE_SERVICE_ROLE_KEY` e server-only e nunca deve ser exposta no
> browser. As outras duas tem prefixo `NEXT_PUBLIC_` e podem ir pro client.

## Arquivos principais

- `supabase/migrations/0001_initial.sql` — schema, RLS e trigger
- `src/server/app-data.ts` — queries (Supabase)
- `src/server/actions.ts` — server actions (CRUD via Supabase)
- `src/server/auth-actions.ts` — sign in / sign up / sign out
- `src/lib/supabase/server.ts` — client SSR com sessao do usuario
- `src/lib/supabase/admin.ts` — client server-only com service_role
- `src/lib/supabase/proxy.ts` — refresh de sessao usado pelo proxy
- `src/proxy.ts` — proxy do Next.js 16 (antigo middleware)
- `docs/lst-technical-spec.md` — especificacao funcional
