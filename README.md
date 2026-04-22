# lst

Web app pessoal para rotina, saude e organizacao com os modulos:

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

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma
- PostgreSQL
- Supabase

## Estado atual

Ja existe no projeto:

- shell visual e navegacao principal
- schema Prisma inicial
- consultas do dashboard e dos modulos
- server actions basicas para criacao
- autenticacao real via Supabase Auth
- clientes Supabase para browser e SSR

## Como rodar

1. Crie um banco PostgreSQL.
2. O projeto ja tem `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Adicione `DATABASE_URL` e `DIRECT_URL` do Supabase para o Prisma.
4. Rode os comandos:

```bash
npm install
npm run prisma:generate
npx prisma db push
npm run prisma:seed
npm run dev
```

## Supabase

O app ja esta preparado para usar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Arquivos criados:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`

Use:

- `DATABASE_URL` com pooler
- `DIRECT_URL` para operacoes diretas de schema

## Arquivos principais

- `docs/lst-technical-spec.md`
- `prisma/schema.prisma`
- `prisma/seed.mjs`
- `src/server/app-data.ts`
- `src/server/actions.ts`

## Proximos passos

- adicionar edicao inline dos registros
- criar logs de conclusao detalhados para treino, dieta e remedios
- anexos de exames
- busca global real
