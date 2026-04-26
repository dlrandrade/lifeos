import { Film, Pencil, Trash2 } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { CheckButton } from "@/components/check-button";
import { InlineAdd } from "@/components/inline-add";
import {
  createMovie,
  deleteMovie,
  updateMovie,
  updateMovieStatus,
} from "@/server/actions";
import { getFilmesData } from "@/server/app-data";

export default async function FilmesPage() {
  const data = await getFilmesData();
  return (
    <PageShell icon={Film}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Filmes{" "}
          <span className="font-normal text-[var(--text-soft)]">
            {new Date().getFullYear()}
          </span>
        </h1>

        <div className="mt-8 space-y-5">
          {data.watching.map((movie) => (
            <MovieRow key={movie.id} movie={movie} active />
          ))}
          {data.queue.map((movie) => (
            <MovieRow key={movie.id} movie={movie} />
          ))}

          {!data.watching.length && !data.queue.length ? (
            <p className="text-sm text-[var(--text-muted)]">
              Nenhum filme na fila.
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {data.watched.length ? (
            <details>
              <summary className="cursor-pointer rounded-full bg-[var(--bg)] px-4 py-2 text-xs font-semibold text-[var(--text-soft)] [&::-webkit-details-marker]:hidden">
                Assistidos
              </summary>
              <div className="mt-3 space-y-3">
                {data.watched.map((movie) => (
                  <MovieRow key={movie.id} movie={movie} faded />
                ))}
              </div>
            </details>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">
              0 assistidos
            </span>
          )}

          <InlineAdd
            action={createMovie}
            fields={[
              { name: "title", placeholder: "Titulo" },
              { name: "genre", placeholder: "Genero", required: false },
            ]}
            label="Novo filme"
            variant="fab"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}

function MovieRow({
  movie,
  active = false,
  faded = false,
}: {
  movie: { id: string; title: string; genre: string | null; status: string };
  active?: boolean;
  faded?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div
          className={`text-base font-bold ${
            faded ? "text-[var(--text-muted)]" : ""
          }`}
        >
          {movie.title}
        </div>
        <div
          className={`text-sm ${
            faded ? "text-[var(--text-muted)]" : "text-[var(--text-soft)]"
          }`}
        >
          {movie.genre ?? "Sem genero"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <details className="relative">
          <summary className="list-none cursor-pointer text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
            <Pencil className="h-4 w-4" strokeWidth={1.7} />
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
            <form action={updateMovie} className="space-y-2">
              <input type="hidden" name="movieId" value={movie.id} />
              <input
                name="title"
                defaultValue={movie.title}
                required
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <input
                name="genre"
                defaultValue={movie.genre ?? ""}
                placeholder="Genero"
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
                movieId={movie.id}
                status="WATCHING"
                label="Assistindo"
                disabled={movie.status === "WATCHING"}
              />
              <StatusButton
                movieId={movie.id}
                status="WATCHED"
                label="Assistido"
                disabled={movie.status === "WATCHED"}
              />
            </div>
          </div>
        </details>
        <form action={deleteMovie}>
          <input type="hidden" name="movieId" value={movie.id} />
          <button
            type="submit"
            aria-label="Excluir"
            className="text-[var(--text-muted)] hover:text-red-600 transition"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </form>
        <CheckButton
          action={updateMovieStatus}
          hiddenFields={{
            movieId: movie.id,
            status: active ? "WATCHED" : "WATCHING",
          }}
          checked={active}
        />
      </div>
    </div>
  );
}

function StatusButton({
  movieId,
  status,
  label,
  disabled,
}: {
  movieId: string;
  status: "TO_WATCH" | "WATCHING" | "WATCHED" | "ABANDONED";
  label: string;
  disabled?: boolean;
}) {
  return (
    <form action={updateMovieStatus}>
      <input type="hidden" name="movieId" value={movieId} />
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
