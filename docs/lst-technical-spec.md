# lst - Especificacao Tecnica Inicial

## 1. Visao Geral

`lst` sera um web app pessoal de organizacao de rotina, saude e consumo de conteudo. O produto centraliza tarefas do dia, treino, dieta, livros, filmes, hidratacao, compromissos, lembretes, remedios e exames em uma unica interface.

As telas anexadas indicam uma UX mobile-first, com dashboard inicial simples, cards por modulo e checklists operacionais. A arquitetura precisa preservar esse visual enxuto, mas com historico persistido em banco para cada acao relevante.

## 2. Objetivo do MVP

Entregar um app responsivo que permita:

- autenticar usuario
- visualizar o resumo do dia
- registrar execucoes diarias
- consultar e editar planos base
- manter historico por data
- navegar entre modulos especializados

## 3. Modulos do Produto

### Dashboard

Responsabilidades:

- saudacao com nome do usuario
- checklist rapido do dia
- cards com acesso aos modulos ativos
- resumo do progresso do dia
- busca global

Indicadores principais:

- tarefas pendentes
- meta de agua
- treino do dia
- refeicoes pendentes
- remedios pendentes
- compromissos do dia
- livro atual
- filme atual ou proximo da lista

### Treino

- cadastro de plano de treino
- dias da semana
- exercicios por dia
- marcacao de conclusao por exercicio
- observacoes
- historico de execucao

### Dieta

- plano alimentar por periodo
- refeicoes por categoria
- itens por refeicao
- marcacao de refeicao concluida
- observacoes e substituicoes
- historico diario

### Livros

- lista por ano
- autor
- status
- progresso
- data de inicio e fim
- filtro por lidos e em andamento

### Filmes

- lista para assistir
- assistidos
- status
- genero
- nota
- comentario
- data assistido

### Hidratacao

- meta diaria em ml
- registros incrementais
- progresso do dia
- historico

### Compromissos

- titulo
- descricao
- data e hora
- local ou link
- status
- lembrete opcional

### Lembretes

- lembretes avulsos
- prioridade
- recorrencia opcional
- data e hora alvo
- status

### Remedios

- cadastro do remedio
- dosagem
- frequencia
- horarios
- controle de tomada
- historico de adesao

### Exames

- cadastro de exame
- categoria
- data agendada
- data realizada
- resultado
- anexo
- proxima recorrencia

## 4. Principios de Negocio

- Tudo deve ser salvo em banco.
- O estado visual nao substitui historico.
- Todo checkbox relevante deve gerar um registro por data/hora.
- Alteracoes em planos nao devem apagar execucoes passadas.
- O dashboard sempre e montado com base na data atual do usuario.
- O app deve nascer multiusuario, mesmo que o uso inicial seja pessoal.

## 5. Requisitos Funcionais

### RF01 - Autenticacao

- login por email e senha
- sessao persistida
- logout
- recuperacao futura de senha

### RF02 - Perfil

- nome
- timezone
- preferencias de exibicao
- metas diarias, como agua

### RF03 - Checklist do Dia

- criar itens diarios
- marcar como concluido
- desmarcar
- listar por data

### RF04 - Treino

- cadastrar plano
- cadastrar dias e exercicios
- marcar execucao de exercicio
- consultar historico por data

### RF05 - Dieta

- cadastrar plano alimentar
- cadastrar refeicoes e itens
- marcar refeicao concluida
- visualizar historico diario

### RF06 - Livros

- cadastrar livro
- alterar status
- registrar progresso
- listar por ano

### RF07 - Filmes

- cadastrar filme
- alterar status
- registrar data assistido
- avaliar com nota

### RF08 - Hidratacao

- definir meta diaria
- registrar consumo
- acompanhar total por dia

### RF09 - Compromissos

- criar compromisso
- editar
- concluir ou cancelar
- listar por periodo

### RF10 - Lembretes

- criar lembrete
- definir prioridade
- definir recorrencia
- marcar como concluido

### RF11 - Remedios

- cadastrar remedio
- definir agenda de horarios
- registrar tomada
- consultar aderencia

### RF12 - Exames

- cadastrar exame
- registrar agendamento
- registrar realizacao
- armazenar resultado ou arquivo

### RF13 - Busca Global

- buscar por titulo, nome, autor, categoria ou descricao

## 6. Requisitos Nao Funcionais

- mobile-first
- responsivo para desktop
- persistencia em PostgreSQL
- backend type-safe
- isolamento de dados por usuario
- auditoria minima de criacao e atualizacao
- latencia baixa para telas diarias

## 7. Stack Recomendada

### Aplicacao

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `PostgreSQL`
- `NextAuth`
- `Zod`

### Infra

- frontend e backend em `Vercel`
- banco `PostgreSQL` gerenciado
- storage futuro para anexos de exames

## 8. Arquitetura de Aplicacao

### Frontend

- App Router do Next.js
- paginas server-first
- componentes client apenas para interacoes
- design system proprio simples baseado nas telas

### Backend

- Server Actions para CRUD simples
- Route Handlers para operacoes mais estruturadas
- validacao com `Zod`
- autorizacao por sessao

### Persistencia

- `Prisma` como ORM
- uso extensivo de tabelas de log para historico

## 9. Mapa de Rotas

- `/login`
- `/dashboard`
- `/tarefas`
- `/treinos`
- `/treinos/[planId]`
- `/dieta`
- `/dieta/[planId]`
- `/livros`
- `/livros/[bookId]`
- `/filmes`
- `/filmes/[movieId]`
- `/hidratacao`
- `/compromissos`
- `/compromissos/[appointmentId]`
- `/lembretes`
- `/remedios`
- `/remedios/[medicationId]`
- `/exames`
- `/exames/[examId]`
- `/configuracoes`

## 10. Estrutura de Pastas Sugerida

```text
src/
  app/
    (auth)/
      login/
    (protected)/
      dashboard/
      tarefas/
      treinos/
      dieta/
      livros/
      filmes/
      hidratacao/
      compromissos/
      lembretes/
      remedios/
      exames/
      configuracoes/
  components/
    ui/
    dashboard/
    tasks/
    workouts/
    meals/
    books/
    movies/
    hydration/
    appointments/
    reminders/
    medications/
    exams/
  lib/
    auth/
    db/
    validations/
    utils/
  server/
    actions/
    queries/
```

## 11. Padrao de Modelagem

O sistema usa duas camadas de dados:

- entidades base, como livro, filme, remedio e exercicio
- registros operacionais, como conclusao, consumo, progresso e tomada

Esse padrao permite alterar cadastros futuros sem perder historico ja executado.

## 12. Telas do MVP

### Dashboard

- cabecalho com saudacao
- checklist do dia
- cards de acesso rapido
- busca

### Treino

- lista semanal
- exercicios por dia
- checkbox de execucao

### Dieta

- refeicoes do plano atual
- itens por refeicao
- checkbox por refeicao

### Livros

- lista do ano
- botao de adicionar
- filtro por status

### Filmes

- lista para assistir
- lista assistidos
- avaliacao

### Hidratacao

- meta do dia
- botoes rapidos de consumo
- historico do dia

### Compromissos

- lista por hoje e proximos
- formulario de criacao

### Lembretes

- lista simples com prioridade e vencimento

### Remedios

- agenda do dia
- historico de tomadas

### Exames

- lista de exames
- status entre agendado e realizado

## 13. Backlog Priorizado

### Fase 1 - Fundacao

- setup do projeto Next.js
- autenticacao
- banco PostgreSQL
- Prisma
- layout base
- navegacao principal

### Fase 2 - Nucleo Diario

- dashboard
- tarefas do dia
- hidratacao
- compromissos
- lembretes

### Fase 3 - Planos Pessoais

- treino
- dieta
- livros
- filmes

### Fase 4 - Saude

- remedios
- exames
- upload de anexos

### Fase 5 - Qualidade de Vida

- busca global
- filtros
- metricas
- insights

## 14. API e Acoes Sugeridas

Operacoes principais:

- `createTask`
- `toggleTaskLog`
- `createWorkoutPlan`
- `toggleWorkoutExerciseLog`
- `createMealPlan`
- `toggleMealLog`
- `createBook`
- `updateBookStatus`
- `createMovie`
- `updateMovieStatus`
- `addWaterLog`
- `createAppointment`
- `createReminder`
- `registerMedicationDose`
- `createExam`
- `uploadExamFile`

## 15. Riscos de Projeto

- tentar unificar cedo demais todos os modulos em uma unica tabela generica
- modelar apenas estado atual e perder historico
- nao considerar timezone do usuario
- nao separar plano base de execucao diaria
- misturar compromissos e lembretes sem regra clara

## 16. Decisoes Pendentes

- login apenas por credenciais ou tambem Google
- notificacoes push, email ou ambas
- sincronizacao com calendario externo
- upload de PDF e imagem para exames no MVP ou fase 2
- nivel de detalhe do progresso de livros e filmes

## 17. Proximo Passo Recomendado

Com base nesta especificacao, o passo seguinte e iniciar o projeto com:

1. scaffold do `Next.js`
2. configuracao de `Prisma` e `PostgreSQL`
3. implementacao de auth
4. entrega da shell do app
5. modulo `Dashboard`
6. modulo `Treino`
7. modulo `Dieta`
