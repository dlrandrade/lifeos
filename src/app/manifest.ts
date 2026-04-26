import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "lst — hub pessoal",
    short_name: "lst",
    description:
      "Rotina, saude e memoria pessoal: dashboard, treinos, dieta, livros, filmes, hidratacao, compromissos, lembretes, remedios e exames.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#efede8",
    theme_color: "#161616",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["lifestyle", "productivity", "health"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Hoje",
        description: "Resumo do dia",
        url: "/dashboard",
      },
      {
        name: "Hidratacao",
        short_name: "Agua",
        description: "Registrar consumo de agua",
        url: "/hidratacao",
      },
      {
        name: "Compromissos",
        short_name: "Agenda",
        description: "Agenda do dia",
        url: "/compromissos",
      },
      {
        name: "Lembretes",
        short_name: "Lembretes",
        description: "Pendencias e lembretes",
        url: "/lembretes",
      },
    ],
  };
}
