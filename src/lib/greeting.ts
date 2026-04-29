type Ctx = {
  firstName: string;
  hour: number;
  weekDay: number; // 0=Dom 1=Seg ... 6=Sab
  pendingTasks: number;
  doneTasks: number;
  hasWorkoutToday: boolean;
  waterPct: number; // 0..100+
  upcomingAppointment: string | null;
  pendingReminders: number;
};

function partOfDay(hour: number): "manha" | "tarde" | "noite" | "madrugada" {
  if (hour < 5) return "madrugada";
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

function salutation(name: string, hour: number) {
  switch (partOfDay(hour)) {
    case "madrugada":
      return `Madrugada, ${name}.`;
    case "manha":
      return `Bom dia, ${name}.`;
    case "tarde":
      return `Boa tarde, ${name}.`;
    case "noite":
      return `Boa noite, ${name}.`;
  }
}

function pickVariants(ctx: Ctx): string[] {
  const total = ctx.pendingTasks + ctx.doneTasks;
  const part = partOfDay(ctx.hour);
  const n = ctx.pendingTasks;
  const itemWord = n === 1 ? "item" : "itens";

  if (ctx.weekDay === 0) {
    return n > 0
      ? [
          `Domingo com ${n} ${itemWord} pra fechar.`,
          `Domingo: ${n} ${itemWord} antes de relaxar.`,
          `Mesmo no domingo, ${n} ${itemWord} esperam.`,
        ]
      : [
          "Domingo livre. Aproveita.",
          "Domingo zerado. Descansa.",
          "Nada na lista. Dia teu.",
        ];
  }
  if (ctx.weekDay === 6) {
    return n > 0
      ? [
          "Sabado nao e desculpa. Vamos.",
          `Sabado tem ${n} ${itemWord}. Bora.`,
          "Sabado produtivo combina contigo.",
        ]
      : [
          "Sabado limpo. Boa.",
          "Sabado sem pendencias. Curta.",
          "Tudo em dia. Bom sabado.",
        ];
  }

  if (n === 0 && total > 0) {
    return [
      "Tudo concluido por aqui. Que tal o que nao esta na lista?",
      "Lista zerada. Hora de algo novo.",
      "Fechou tudo. Bonus round?",
    ];
  }

  if (total === 0) {
    return [
      "Sem tarefas hoje. Que tal comecar agora?",
      "Lista vazia. Bora preencher.",
      "Nada na agenda. Define o dia.",
    ];
  }

  if (n >= 5) {
    return [
      "Muita coisa pra fazer hoje? Que tal comecar agora?",
      `${n} ${itemWord} na fila. Comecar pelo mais leve.`,
      `Dia cheio: ${n} ${itemWord}. Um de cada vez.`,
    ];
  }

  if (n <= 2 && ctx.doneTasks > 0) {
    return [
      `Quase la. Faltam ${n}.`,
      `So mais ${n} ${itemWord}.`,
      "Reta final do dia.",
    ];
  }

  if (part === "noite" && n > 0) {
    return [
      `Resta ${n} ${itemWord} antes de dormir.`,
      `Antes de fechar o dia: ${n} ${itemWord}.`,
      "Ultima chamada do dia.",
    ];
  }

  if (part === "manha" && ctx.hasWorkoutToday) {
    return [
      "Treino primeiro, depois o resto.",
      "Manha de treino. Vamos.",
      "Comeca pelo treino.",
    ];
  }

  if (part === "tarde" && ctx.waterPct < 50) {
    return [
      "Bebeu pouca agua hoje. Coloca um copo no caminho.",
      "Hidratacao baixa. Pega uma agua.",
      "Tarde quente. Bebe agua.",
    ];
  }

  if (ctx.upcomingAppointment) {
    return [
      `Logo mais: ${ctx.upcomingAppointment}.`,
      `Atencao: ${ctx.upcomingAppointment}.`,
      `Prepare-se para ${ctx.upcomingAppointment}.`,
    ];
  }

  if (ctx.pendingReminders >= 3) {
    return [
      `Tem ${ctx.pendingReminders} lembretes parados.`,
      `${ctx.pendingReminders} lembretes esperando.`,
      "Lembretes acumulando. Da uma olhada.",
    ];
  }

  return [
    `Voce tem ${n} ${n === 1 ? "tarefa" : "tarefas"}. Que tal comecar agora?`,
    `${n} ${n === 1 ? "tarefa" : "tarefas"} na fila pra hoje.`,
    "Bom ritmo. Segue.",
  ];
}

export function buildGreeting(ctx: Ctx, lastHook: string | null = null) {
  const variants = pickVariants(ctx);
  const lastDecoded = lastHook ? decodeURIComponent(lastHook) : null;
  const idx = lastDecoded ? variants.indexOf(lastDecoded) : -1;
  const hook =
    idx >= 0 ? variants[(idx + 1) % variants.length] : variants[0];
  return {
    salutation: salutation(ctx.firstName, ctx.hour),
    hook,
  };
}
