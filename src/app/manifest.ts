import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "lifeOS",
    short_name: "lifeOS",
    description:
      "Hub pessoal de rotina, saude, leitura e organizacao. Tarefas, treinos, dieta, livros, filmes, hidratacao, compromissos, lembretes, remedios e exames.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e8e6e2",
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
      { name: "Hoje", short_name: "Hoje", url: "/dashboard" },
      { name: "Treino", short_name: "Treino", url: "/treinos" },
      { name: "Hidratacao", short_name: "Agua", url: "/hidratacao" },
      { name: "Lembretes", short_name: "Lembretes", url: "/lembretes" },
    ],
  };
}
