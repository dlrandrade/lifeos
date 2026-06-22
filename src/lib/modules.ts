import { Bell, Droplets, Dumbbell, HeartPulse } from "lucide-react";

// Nucleo enxuto do lifeOS. Modulos arquivados (dieta, livros, filmes,
// compromissos, remedios, exames, boards) permanecem no codigo/banco, mas
// fora da navegacao. Ver PROJECT.md secoes 3 e 9.
export const modules = [
  {
    slug: "dashboard",
    label: "Dashboard",
    shortLabel: "Hoje",
    description: "Resumo do dia, foco imediato e progresso do nucleo.",
    icon: HeartPulse,
  },
  {
    slug: "treinos",
    label: "Treinos",
    shortLabel: "Treino",
    description: "Plano semanal, exercicios e historico de execucao.",
    icon: Dumbbell,
  },
  {
    slug: "hidratacao",
    label: "Hidratacao",
    shortLabel: "Agua",
    description: "Meta diaria, consumo em ml e historico.",
    icon: Droplets,
  },
  {
    slug: "lembretes",
    label: "Lembretes",
    shortLabel: "Lembretes",
    description: "Pendencias do dia, prioridade e conclusao.",
    icon: Bell,
  },
] as const;
