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
- seed inicial com usuario demo
- clientes Supabase para browser e SSR

Autenticacao real ainda nao foi implementada. Nesta fase, o app usa um usuario demo persistido no banco.

## Como rodar

1. Crie um banco PostgreSQL.
2. O projeto ja tem `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Adicione a `DATABASE_URL` do Supabase para o Prisma.
4. Rode os comandos:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
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

Para concluir o uso do Prisma com Supabase, ainda falta preencher `DATABASE_URL` com a connection string Postgres do projeto.

No painel do Supabase, abra `Connect` e copie a string de conexao do Postgres apropriada para Prisma.

## Usuario demo

Por padrao o app usa:

- `DEMO_USER_EMAIL=demo@lst.app`

Voce pode alterar isso no `.env`.

## Arquivos principais

- `docs/lst-technical-spec.md`
- `prisma/schema.prisma`
- `prisma/seed.mjs`
- `src/server/app-data.ts`
- `src/server/actions.ts`

## Proximos passos

- autenticar usuarios reais
- adicionar edicao e exclusao
- criar logs de conclusao para tarefas, treino, dieta e remedios
- anexos de exames
- busca global real
