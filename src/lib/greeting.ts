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

function pickHook(ctx: Ctx): string {
  const total = ctx.pendingTasks + ctx.doneTasks;
  const part = partOfDay(ctx.hour);

  // Final de semana
  if (ctx.weekDay === 0)
    return ctx.pendingTasks > 0
      ? `Domingo com ${ctx.pendingTasks} ${ctx.pendingTasks === 1 ? "item" : "itens"} pra fechar.`
      : "Domingo livre. Aproveita.";
  if (ctx.weekDay === 6)
    return ctx.pendingTasks > 0
      ? "Sabado nao e desculpa. Vamos."
      : "Sabado limpo. Boa.";

  // Dia em progresso
  if (ctx.pendingTasks === 0 && total > 0)
    return "Tudo concluido por aqui. Que tal o que nao esta na lista?";

  if (total === 0) return "Sem tarefas hoje. Que tal comecar agora?";

  if (ctx.pendingTasks >= 5) return "Muita coisa pra fazer hoje? Que tal comecar agora?";

  if (ctx.pendingTasks <= 2 && ctx.doneTasks > 0)
    return `Quase la. Faltam ${ctx.pendingTasks}.`;

  if (part === "noite" && ctx.pendingTasks > 0)
    return `Resta ${ctx.pendingTasks} ${ctx.pendingTasks === 1 ? "item" : "itens"} antes de dormir.`;

  if (part === "manha" && ctx.hasWorkoutToday)
    return "Treino primeiro, depois o resto.";

  if (part === "tarde" && ctx.waterPct < 50)
    return "Bebeu pouca agua hoje. Coloca um copo no caminho.";

  if (ctx.upcomingAppointment)
    return `Logo mais: ${ctx.upcomingAppointment}.`;

  if (ctx.pendingReminders >= 3)
    return `Tem ${ctx.pendingReminders} lembretes parados.`;

  return `Voce tem ${ctx.pendingTasks} ${ctx.pendingTasks === 1 ? "tarefa" : "tarefas"}. Que tal comecar agora?`;
}

export function buildGreeting(ctx: Ctx) {
  return {
    salutation: salutation(ctx.firstName, ctx.hour),
    hook: pickHook(ctx),
  };
}
