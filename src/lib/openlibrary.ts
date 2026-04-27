import "server-only";

type OpenLibraryDoc = {
  title?: string;
  author_name?: string[];
  cover_i?: number;
  cover_edition_key?: string;
  isbn?: string[];
};

/**
 * Busca a melhor capa para um livro no OpenLibrary.
 * Faz best-effort: timeout curto e retorna null em qualquer falha.
 */
export async function fetchBookCover(
  title: string,
  author?: string | null,
): Promise<string | null> {
  const params = new URLSearchParams();
  params.set("title", title);
  if (author) params.set("author", author);
  params.set("limit", "1");
  params.set("fields", "title,author_name,cover_i,cover_edition_key,isbn");

  const url = `https://openlibrary.org/search.json?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = (await res.json()) as { docs?: OpenLibraryDoc[] };
    const doc = data.docs?.[0];
    if (!doc) return null;

    if (doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    }
    if (doc.cover_edition_key) {
      return `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`;
    }
    if (doc.isbn?.length) {
      return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
    }
    return null;
  } catch {
    return null;
  }
}
