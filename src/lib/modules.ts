import {
  Bell,
  BookOpen,
  CalendarDays,
  Droplets,
  Dumbbell,
  Film,
  HeartPulse,
  Pill,
  Sandwich,
  TestTubeDiagonal,
} from "lucide-react";

export const modules = [
  {
    slug: "dashboard",
    label: "Dashboard",
    shortLabel: "Hoje",
    description: "Resumo do dia, foco imediato e progresso dos modulos.",
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
    slug: "dieta",
    label: "Dieta",
    shortLabel: "Dieta",
    description: "Plano alimentar, refeicoes e conclusao diaria.",
    icon: Sandwich,
  },
  {
    slug: "livros",
    label: "Livros",
    shortLabel: "Livros",
    description: "Leituras do ano, progresso e livros concluidos.",
    icon: BookOpen,
  },
  {
    slug: "filmes",
    label: "Filmes",
    shortLabel: "Filmes",
    description: "Fila para assistir, historico e avaliacao.",
    icon: Film,
  },
  {
    slug: "hidratacao",
    label: "Hidratacao",
    shortLabel: "Agua",
    description: "Meta diaria, consumo em ml e historico.",
    icon: Droplets,
  },
  {
    slug: "compromissos",
    label: "Compromissos",
    shortLabel: "Agenda",
    description: "Agenda, horarios e acompanhamento de status.",
    icon: CalendarDays,
  },
  {
    slug: "lembretes",
    label: "Lembretes",
    shortLabel: "Lembretes",
    description: "Pendencias, prioridade e recorrencia opcional.",
    icon: Bell,
  },
  {
    slug: "remedios",
    label: "Remedios",
    shortLabel: "Remedios",
    description: "Cadastro, horarios e historico de tomadas.",
    icon: Pill,
  },
  {
    slug: "exames",
    label: "Exames",
    shortLabel: "Exames",
    description: "Agendamento, realizacao e anexos de resultados.",
    icon: TestTubeDiagonal,
  },
] as const;

export const dashboardChecklist = [
  "Beber agua",
  "Tomar creatina",
  "Confirmar treino de peito e triceps",
  "Registrar cafe da manha",
  "Ler 20 paginas",
];

export const dashboardHighlights = [
  { title: "Treino de hoje", value: "6 exercicios", meta: "Segunda-feira" },
  { title: "Dieta ativa", value: "4 refeicoes", meta: "Plano Abril" },
  { title: "Hidratacao", value: "1.2L / 2.5L", meta: "48% da meta" },
  { title: "Compromissos", value: "2 agendados", meta: "1 presencial" },
];

export const modulePreview = {
  treinos: {
    title: "Treino do dia",
    eyebrow: "Segunda-feira",
    items: [
      "Supino reto",
      "Supino inclinado",
      "Voador",
      "Triceps maquina",
    ],
  },
  dieta: {
    title: "Dieta ativa",
    eyebrow: "Abril",
    items: ["Cafe da manha", "Almoco", "Lanche", "Jantar"],
  },
  livros: {
    title: "Leitura atual",
    eyebrow: "2026",
    items: ["Mestria", "Robert Greene", "Leitura em andamento"],
  },
  filmes: {
    title: "Fila de filmes",
    eyebrow: "Para assistir",
    items: ["Dune: Part Two", "Perfect Days", "The Holdovers"],
  },
  hidratacao: {
    title: "Meta de agua",
    eyebrow: "Hoje",
    items: ["500ml ao acordar", "500ml manha", "700ml tarde", "800ml noite"],
  },
  compromissos: {
    title: "Agenda",
    eyebrow: "Hoje",
    items: ["09:00 Dentista", "14:00 Reuniao", "19:30 Jantar familia"],
  },
  lembretes: {
    title: "Pendencias",
    eyebrow: "Prioridade alta",
    items: ["Pagar carro", "Agendar exame", "Comprar remedio"],
  },
  remedios: {
    title: "Medicacao",
    eyebrow: "Tomadas",
    items: ["Vitamina D - 08:00", "Creatina - 10:00", "Omeprazol - 21:00"],
  },
  exames: {
    title: "Exames",
    eyebrow: "Proximos",
    items: ["Hemograma", "Vitamina D", "Colesterol total"],
  },
} as const;
