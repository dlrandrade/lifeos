import { ModulePage } from "@/components/module-page";
import { createBook, deleteBook, updateBookStatus } from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function LivrosPage() {
  const data = await getModuleData("livros");
  return (
    <ModulePage
      slug="livros"
      countLabel={data.countLabel}
      records={data.records.map((record) => ({
        ...record,
        actions: [
          {
            label: "Lendo",
            action: updateBookStatus,
            hiddenFields: { bookId: record.id, status: "READING" },
            tone: "dark",
          },
          {
            label: "Concluir",
            action: updateBookStatus,
            hiddenFields: { bookId: record.id, status: "FINISHED" },
          },
          {
            label: "Excluir",
            action: deleteBook,
            hiddenFields: { bookId: record.id },
            tone: "danger",
          },
        ],
      }))}
      createCard={{
        title: "Novo livro",
        description: "Adiciona um livro ao acervo pessoal do app.",
        action: createBook,
        fields: [
          { name: "title", placeholder: "Titulo do livro" },
          { name: "author", placeholder: "Autor", required: false },
        ],
        submitLabel: "Salvar livro",
      }}
    />
  );
}
