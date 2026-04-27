import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { CheckButton } from "@/components/check-button";
import { InlineAdd } from "@/components/inline-add";
import {
  createBook,
  deleteBook,
  updateBook,
  updateBookStatus,
} from "@/server/actions";
import { getLivrosData } from "@/server/app-data";

export default async function LivrosPage() {
  const data = await getLivrosData();

  return (
    <PageShell icon={BookOpen}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Livros{" "}
          <span className="font-normal text-[var(--text-soft)]">{data.year}</span>
        </h1>

        <div className="mt-8 space-y-5">
          {data.reading.map((book) => (
            <BookRow key={book.id} book={book} active />
          ))}

          {data.queue.map((book) => (
            <BookRow key={book.id} book={book} />
          ))}

          {!data.reading.length && !data.queue.length ? (
            <p className="text-sm text-[var(--text-muted)]">
              Nenhum livro cadastrado ainda.
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {data.finished.length ? (
            <details>
              <summary className="cursor-pointer rounded-full bg-[var(--bg)] px-4 py-2 text-xs font-semibold text-[var(--text-soft)] [&::-webkit-details-marker]:hidden">
                Lidos, {data.year - 1}
              </summary>
              <div className="mt-3 space-y-3">
                {data.finished.map((book) => (
                  <BookRow key={book.id} book={book} faded />
                ))}
              </div>
            </details>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">0 lidos</span>
          )}

          <InlineAdd
            action={createBook}
            fields={[
              { name: "title", placeholder: "Titulo" },
              { name: "author", placeholder: "Autor", required: false },
            ]}
            label="Novo livro"
            variant="fab"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}

function BookRow({
  book,
  active = false,
  faded = false,
}: {
  book: {
    id: string;
    title: string;
    author: string | null;
    status: string;
    cover_url?: string | null;
  };
  active?: boolean;
  faded?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className={`h-14 w-10 rounded-md object-cover flex-shrink-0 ${faded ? "opacity-50" : ""}`}
          />
        ) : null}
        <div className="min-w-0">
          <div
            className={`text-base font-bold ${
              faded ? "text-[var(--text-muted)]" : ""
            }`}
          >
            {book.title}
          </div>
          <div
            className={`text-sm ${
              faded ? "text-[var(--text-muted)]" : "text-[var(--text-soft)]"
            }`}
          >
            {book.author ?? "Autor indefinido"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <details className="relative">
          <summary className="list-none cursor-pointer text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
            <Pencil className="h-4 w-4" strokeWidth={1.7} />
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
            <form action={updateBook} className="space-y-2">
              <input type="hidden" name="bookId" value={book.id} />
              <input
                name="title"
                defaultValue={book.title}
                required
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <input
                name="author"
                defaultValue={book.author ?? ""}
                placeholder="Autor"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
              >
                Salvar
              </button>
            </form>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <StatusButton
                bookId={book.id}
                status="READING"
                label="Lendo"
                disabled={book.status === "READING"}
              />
              <StatusButton
                bookId={book.id}
                status="FINISHED"
                label="Concluir"
                disabled={book.status === "FINISHED"}
              />
            </div>
          </div>
        </details>
        <form action={deleteBook}>
          <input type="hidden" name="bookId" value={book.id} />
          <button
            type="submit"
            aria-label="Excluir"
            className="text-[var(--text-muted)] hover:text-red-600 transition"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </form>
        <CheckButton
          action={updateBookStatus}
          hiddenFields={{
            bookId: book.id,
            status: active ? "FINISHED" : "READING",
          }}
          checked={active}
          ariaLabel={active ? "Marcar concluido" : "Comecar a ler"}
        />
      </div>
    </div>
  );
}

function StatusButton({
  bookId,
  status,
  label,
  disabled,
}: {
  bookId: string;
  status: "READING" | "FINISHED" | "ABANDONED" | "TO_READ";
  label: string;
  disabled?: boolean;
}) {
  return (
    <form action={updateBookStatus}>
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold disabled:opacity-50"
      >
        {label}
      </button>
    </form>
  );
}
