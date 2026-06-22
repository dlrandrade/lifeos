# lifeOS — Norte do Projeto (fonte única de verdade)

> **🤖 LEIA ISTO PRIMEIRO — AI / AGENT START HERE.**
> Este é o documento mestre do projeto. Qualquer IA, agente ou pessoa que
> for continuar o lifeOS **deve ler este arquivo inteiro antes de escrever
> qualquer código** e manter as decisões abaixo. Se uma instrução em outro
> lugar conflitar com este arquivo, este arquivo vence — exceto pelas regras
> de versão do Next.js em `AGENTS.md`, que continuam valendo.
>
> **Read this whole file before doing anything.** It is the single source of
> truth for vision, scope, conventions and roadmap. Keep it updated: whenever
> you finish a meaningful change, update the "Estado atual" and "Roadmap"
> sections in the same commit.

Última atualização: 2026-06-22 (Fase 0+1 executadas) · Branch: `claude/admiring-lovelace-qpxvcx`

---

## 1. O que é o lifeOS

App pessoal (PWA) para organizar a rotina e a saúde do dia a dia. Uso pessoal,
mas a arquitetura nasce multiusuário (auth + RLS por usuário).

## 2. Visão e princípios (o "norte")

O objetivo da retomada é **simplicidade radical com elegância**:

1. **Minimalista e elegante.** Pouca informação por tela, muito respiro,
   tipografia limpa (Inter), paleta neutra (areia/grafite). Nada de poluição.
2. **Abre perfeitamente no iOS.** Roda como PWA em tela cheia (standalone),
   respeitando safe-areas (notch/Dynamic Island/home indicator), sem zoom
   acidental, sem bounce estranho, com ícone e splash corretos.
3. **Super funcional.** Cada toque resolve algo de verdade. Tudo persiste no
   banco. Estado visual nunca substitui histórico.
4. **Rápido.** Server-first (RSC), poucos componentes client, carregamento
   instantâneo. Menos é mais.

> Regra de ouro: **na dúvida, remova.** Se uma feature não serve à rotina
> diária real do usuário, ela vira backlog — não entra na tela.

## 3. Escopo decidido (IMPORTANTE)

Decisão tomada com o dono do produto em 2026-06-22: **reduzir para um núcleo
enxuto.** O app tinha 10 módulos; a versão minimalista mantém só os essenciais
do dia a dia.

**Núcleo ativo (manter e polir):**
- **Dashboard / Hoje** — hub do dia, saudação dinâmica, foco imediato.
- **Treinos** — plano semanal, exercícios, marcação de execução + histórico.
- **Hidratação** — meta diária, registro incremental, progresso do dia.
- **Lembretes / Tarefas do dia** — checklist diário com prioridade.

**Arquivados (NÃO exibir na navegação; código e tabelas preservados):**
Dieta, Livros, Filmes, Compromissos, Remédios, Exames, e os "boards"
(listas customizáveis).

> Como arquivar corretamente: **não apague** as rotas, server actions, nem as
> tabelas/migrations desses módulos. Apenas remova-os da navegação/dashboard
> (`src/lib/modules.ts` e os cards do `src/components/dashboard-page.tsx`) para
> que não apareçam. Assim podemos reativar qualquer módulo no futuro sem
> reescrever nada nem perder histórico. Se precisar bloquear acesso direto por
> URL, faça um redirect simples para `/dashboard`.

iOS: distribuição via **PWA "Adicionar à Tela de Início"** (sem App Store por
ora). Empacotar nativo (ex.: Capacitor) fica como possibilidade futura, não é
meta atual.

## 4. Estado atual (o que já existe)

- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 ·
  Supabase (Auth + Postgres + PostgREST + RLS) · Zod · lucide-react · date-fns.
- **Auth** funcionando (email/senha) via Supabase SSR; proxy faz refresh de
  sessão (`src/proxy.ts`, antigo middleware).
- **PWA:** manifest (`src/app/manifest.ts`), service worker (`public/sw.js`),
  página offline, ícones em `public/icons/`, meta `appleWebApp` no layout.
- **10 módulos implementados** com CRUD + histórico (ver tabelas na seção 6).
- **UI** já redesenhada num visual claro (areia/grafite, cards brancos),
  dashboard em tela fixa com carrossel de categorias e busca.
- `node_modules` **não** está instalado no checkout limpo → rode `npm install`.
- **Segredos** ficam em `.env.local` (não versionado). Sem ele, nada de
  Supabase roda. Ver seção 7.

### Gaps conhecidos / o que falta para o "norte"
- [x] Reduzir navegação ao núcleo (seção 3) — feito no dashboard + manifest.
- [x] `font-size: 16px` em inputs (regra em `globals.css`, evita zoom no Safari).
- [x] Safe-areas iOS via classe `.safe-area` no dashboard e no layout protegido.
- [x] Remover busca global (decisão 2) — input removido do dashboard.
- [x] Tema claro fixo (decisão 3) — `viewport.themeColor` único + `maximumScale: 1`.
- [ ] Notificações no núcleo (decisão 4) — **próxima prioridade**, ainda não feita
      (precisa permissão + agendamento; ver Fase 4).
- [ ] Unificação total de Tarefas + Lembretes no módulo "Hoje" (hoje o Dashboard
      já é o "Hoje" e Lembretes segue como rota do núcleo; falta fundir os
      modelos `tasks` + `reminders`). Ver decisão 1.
- [ ] Estados vazios elegantes para cada módulo do núcleo.
- [ ] Revisar o dashboard `fixed inset-0` com teclado aberto no iOS (testar em device).
- [ ] Splash screens iOS (`apple-touch-startup-image`) opcionais.

## 5. Mapa de arquivos (onde mexer)

```
src/
  app/
    layout.tsx              # metadata, viewport, appleWebApp, fonte Inter
    globals.css             # design tokens (CSS vars) + base
    manifest.ts             # PWA manifest (servido em /manifest.webmanifest)
    page.tsx                # landing/redirect
    login/page.tsx          # auth
    (app)/
      layout.tsx            # shell protegido (checa sessão)
      dashboard/page.tsx    # Hoje
      treinos/page.tsx      # núcleo
      hidratacao/page.tsx   # núcleo
      lembretes/page.tsx    # núcleo
      dieta|livros|filmes|compromissos|remedios|exames/  # ARQUIVAR
      lista/[id]/page.tsx   # boards (ARQUIVAR)
  components/
    dashboard-page.tsx      # render do dashboard (ajustar cards = arquivar)
    page-shell.tsx, item-row.tsx, inline-add.tsx, check-button.tsx, ...
  server/
    app-data.ts             # queries (Supabase)  ~1000 linhas
    actions.ts              # server actions / CRUD ~1000 linhas
    auth-actions.ts         # sign in/up/out
  lib/
    modules.ts              # ÍNDICE da navegação — editar aqui p/ arquivar
    supabase/{server,client,admin,proxy,types}.ts
    greeting.ts             # saudação dinâmica
public/
  sw.js, icons/             # PWA
supabase/migrations/        # 0001 schema+RLS+trigger, 0002 boards, 0003/0004 treinos v2
```

## 6. Banco de dados (Supabase / Postgres)

Tudo com RLS por `user_id`. Padrão de modelagem: **entidade base** + **logs**
operacionais por data (não apagar histórico ao editar plano).

- Perfil/água: `profiles`, `water_goals`, `water_logs`
- Tarefas: `tasks`, `task_logs`
- Treino: `workout_plans`, `workout_days`, `workout_exercises`, `workout_logs`
- Dieta (arquivado): `meal_plans`, `meal_sections`, `meal_items`, `meal_logs`
- Livros/Filmes (arquivado): `books`, `book_logs`, `movies`, `movie_logs`
- Agenda (arquivado): `appointments`, `reminders`
- Saúde (arquivado): `medications`, `medication_schedules`, `medication_logs`,
  `exams`, `exam_logs`, `exam_files`
- Boards (arquivado): `boards`, `board_items`, `board_item_logs`

Migrations existentes em `supabase/migrations/`. Para mudanças de schema use uma
nova migration numerada (`0005_...sql`) — **nunca** edite migrations já aplicadas.

## 7. Como rodar (ambiente limpo)

```bash
npm install
# crie .env.local na raiz com:
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_SERVICE_ROLE_KEY=...     (server-only, nunca no client)
npm run dev      # http://localhost:3000
npm run build    # valida produção
npm run lint
```
No Supabase, rodar as migrations de `supabase/migrations/` em ordem (SQL Editor).
Deploy: Vercel (mesmas 3 env vars em Production + Preview).

## 8. Convenções (siga à risca)

- **Next.js 16 é diferente do seu conhecimento prévio.** Antes de codar,
  leia o guia relevante em `node_modules/next/dist/docs/`. (Ver `AGENTS.md`.)
- Server-first: páginas e data-fetch em RSC; `"use client"` só para interação.
- CRUD via **server actions** em `src/server/actions.ts`; queries em
  `src/server/app-data.ts`. Validar entrada com **Zod**.
- Estilo: **Tailwind 4** + design tokens em `globals.css` (`var(--bg)`,
  `--card`, `--text`, etc.). Não introduzir bibliotecas de UI pesadas.
- Texto da interface em **pt-BR**.
- iOS: usar `env(safe-area-inset-*)`, `viewport-fit=cover` (já no layout),
  inputs com `font-size >= 16px`, alvos de toque >= 44px.
- Não commitar segredos. `.env.local` fica fora do git.

## 9. Roadmap de retomada (faça nesta ordem)

**Fase 0 — Higiene (rápida)** ✅
- [x] `npm install` e `npm run build`/`lint` validados localmente.
- [ ] Confirmar `.env.local` / variáveis na Vercel (depende do dono).

**Fase 1 — Enxugar para o núcleo** ✅
- [x] `src/lib/modules.ts` só com Dashboard, Treinos, Hidratação, Lembretes.
- [x] Cards/carrossel do `dashboard-page.tsx` reduzidos ao núcleo.
- [x] `homeItems` do `app-data.ts` só com água/treino/lembretes.
- [~] Sem redirect dos arquivados (decisão: preservar código; ficam fora da nav).

**Fase 2 — iOS impecável** (parcial)
- [x] Safe-areas (`.safe-area`) no dashboard e no layout protegido.
- [x] Inputs 16px (sem zoom); `maximumScale: 1`.
- [ ] Validar em device real: teclado aberto no dashboard `fixed`, bounce.
- [ ] Splash screens iOS (`apple-touch-startup-image`) — opcional.

**Fase 3 — Polimento minimalista**
- [ ] Estados vazios e de carregamento elegantes no núcleo.
- [ ] Microinterações sutis (toque/check) sem exageros.

**Fase 4 — Funcional de verdade**
- [ ] **Notificações do núcleo** (decisão 4) — treino do dia / meta de água /
      lembrete vencendo. Definir push vs local antes (ver seção 11).
- [ ] Garantir que cada check do núcleo grava log por data.
- [ ] Revisar histórico de treino e hidratação.
- [ ] Fundir modelos `tasks` + `reminders` no "Hoje" (decisão 1).

> Ao concluir qualquer item, **marque aqui e atualize a seção 4** no mesmo commit.

## 10. Decisões registradas

- 2026-06-22 — Reduzir para núcleo enxuto (Dashboard, Treinos, Hidratação,
  Lembretes). Demais módulos arquivados, não deletados.
- 2026-06-22 — iOS via PWA (Add to Home Screen). Nativo fica como futuro.
- 2026-06-22 — Lembretes + Tarefas convergem para o conceito "Hoje". O
  Dashboard já é o "Hoje" (lista do dia). Fusão completa dos modelos `tasks` +
  `reminders` fica como refinamento futuro (ver gaps).
- 2026-06-22 — Busca global removida por enquanto.
- 2026-06-22 — Tema claro fixo (areia). Sem modo escuro por ora.
- 2026-06-22 — Notificações (push/local) fazem parte do núcleo desejado;
  ainda não implementadas — próxima prioridade funcional.

### Como os módulos foram arquivados (referência)
Não houve deleção. Removidos apenas da navegação: cards do `dashboard-page.tsx`,
fontes do `homeItems` em `app-data.ts`, atalhos do manifest e a lista em
`modules.ts`. Rotas, server actions e tabelas seguem intactas e acessíveis por
URL direta. Para reativar um módulo, basta recolocar seu card/atalho.

## 11. Decisões em aberto (pergunte ao dono antes de assumir)

- Notificações: push (web push + servidor) ou apenas locais? Para quais eventos
  do núcleo (treino do dia, meta de água, lembrete vencendo)?
- Fundir de fato `tasks` + `reminders` numa única tabela "Hoje", ou manter dois
  modelos e só unificar a UI?

---

### Como manter este arquivo (regra para qualquer IA)
1. Leu? Então siga a seção 2 (princípios) e a seção 3 (escopo) sem desviar.
2. Mudou algo relevante? Atualize seções 4, 9 e 10 **no mesmo commit**.
3. Decisão de produto nova? Registre na seção 10. Dúvida de produto? Não
   invente: pergunte ao dono e anote na seção 11.
