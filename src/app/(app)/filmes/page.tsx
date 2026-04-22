import { ModulePage } from "@/components/module-page";
import { createMovie, deleteMovie, updateMovieStatus } from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function FilmesPage() {
  const data = await getModuleData("filmes");
  return (
    <ModulePage
      slug="filmes"
      countLabel={data.countLabel}
      records={data.records.map((record) => ({
        ...record,
        actions: [
          {
            label: "Assistindo",
            action: updateMovieStatus,
            hiddenFields: { movieId: record.id, status: "WATCHING" },
            tone: "dark",
          },
          {
            label: "Assistido",
            action: updateMovieStatus,
            hiddenFields: { movieId: record.id, status: "WATCHED" },
          },
          {
            label: "Excluir",
            action: deleteMovie,
            hiddenFields: { movieId: record.id },
            tone: "danger",
          },
        ],
      }))}
      createCard={{
        title: "Novo filme",
        description: "Adiciona um filme na fila ou no historico.",
        action: createMovie,
        fields: [
          { name: "title", placeholder: "Titulo do filme" },
          { name: "genre", placeholder: "Genero", required: false },
        ],
        submitLabel: "Salvar filme",
      }}
    />
  );
}
