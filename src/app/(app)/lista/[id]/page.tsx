import { redirect } from "next/navigation";
import { Layers, ListChecks, Timer, Calendar, NotebookPen, type LucideIcon } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import { CheckButton } from "@/components/check-button";
import { getCurrentUserContext } from "@/server/app-data";
import {
  createBoardItem,
  deleteBoard,
  deleteBoardItem,
  toggleBoardItemForToday,
  updateBoard,
  updateBoardItem,
} from "@/server/actions";
import type { Board, BoardItem, BoardModel } from "@/lib/supabase/types";

const MODEL_ICON: Record<BoardModel, LucideIcon> = {
  CHECKLIST: ListChecks,
  CATALOG: Layers,
  COUNTER: Timer,
  SCHEDULE: Calendar,
  NOTE: NotebookPen,
};

const MODEL_LABEL: Record<BoardModel, string> = {
  CHECKLIST: "checklist",
  CATALOG: "catalogo",
  COUNTER: "contador",
  SCHEDULE: "agenda",
  NOTE: "notas",
};

export default async function ListaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, supabase } = await getCurrentUserContext();
  const todayDate = new Date().toISOString().slice(0, 10);

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle<Board>();

  if (!board) {
    redirect("/dashboard");
  }

  const { data: items = [] } = await supabase
    .from("board_items")
    .select("*")
    .eq("board_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<BoardItem[]>();

  const itemList = items ?? [];

  let completedSet = new Set<string>();
  if (board.model === "CHECKLIST" && itemList.length) {
    const ids = itemList.map((i) => i.id);
    const { data: logs } = await supabase
      .from("board_item_logs")
      .select("board_item_id, completed")
      .in("board_item_id", ids)
      .eq("occurred_on", todayDate);
    completedSet = new Set(
      (logs ?? [])
        .filter((l: { completed: boolean }) => l.completed)
        .map((l: { board_item_id: string }) => l.board_item_id),
    );
  }

  const Icon = MODEL_ICON[board.model];

  return (
    <PageShell icon={Icon}>
      <InnerCard>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {board.name}{" "}
            <span className="font-normal text-[var(--text-soft)]">
              {MODEL_LABEL[board.model]}
            </span>
          </h1>
          <details className="relative">
            <summary className="list-none cursor-pointer text-xs text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
              editar
            </summary>
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
              <form action={updateBoard} className="space-y-2">
                <input type="hidden" name="boardId" value={board.id} />
                <input
                  name="name"
                  defaultValue={board.name}
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
                >
                  Salvar
                </button>
              </form>
              <form action={deleteBoard} className="mt-2">
                <input type="hidden" name="boardId" value={board.id} />
                <button
                  type="submit"
                  className="w-full rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  Excluir lista
                </button>
              </form>
            </div>
          </details>
        </div>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {itemList.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">
              Lista vazia. Adicione abaixo.
            </p>
          ) : (
            itemList.map((item) => (
              <BoardItemRow
                key={item.id}
                item={item}
                model={board.model}
                checkedToday={completedSet.has(item.id)}
              />
            ))
          )}
        </div>

        <div className="mt-8">
          <InlineAdd
            action={createBoardItem}
            hiddenFields={{ boardId: board.id }}
            fields={fieldsForModel(board.model)}
            label="Adicionar item"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}

function fieldsForModel(model: BoardModel) {
  switch (model) {
    case "COUNTER":
      return [
        { name: "title", placeholder: "Titulo (ex.: copo de agua)" },
        { name: "amount", placeholder: "Valor", type: "number" as const, required: false },
      ];
    case "SCHEDULE":
      return [
        { name: "title", placeholder: "Titulo" },
        {
          name: "occurredAt",
          placeholder: "Data e hora",
          type: "datetime-local" as const,
          required: false,
        },
      ];
    case "NOTE":
      return [
        { name: "title", placeholder: "Titulo" },
        { name: "description", placeholder: "Notas", required: false },
      ];
    case "CATALOG":
    case "CHECKLIST":
    default:
      return [{ name: "title", placeholder: "Titulo" }];
  }
}

function BoardItemRow({
  item,
  model,
  checkedToday,
}: {
  item: BoardItem;
  model: BoardModel;
  checkedToday: boolean;
}) {
  const subtitle = (() => {
    switch (model) {
      case "COUNTER":
        return item.amount != null ? `${item.amount}` : item.description;
      case "SCHEDULE":
        return item.occurred_at
          ? `${new Date(item.occurred_at).toLocaleDateString("pt-BR")} ${new Date(item.occurred_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
          : item.description;
      case "NOTE":
        return item.description;
      default:
        return item.description;
    }
  })();

  if (model === "CHECKLIST") {
    return (
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <CheckButton
            action={toggleBoardItemForToday}
            hiddenFields={{ itemId: item.id }}
            checked={checkedToday}
          />
          <div className="min-w-0">
            <div
              className={`truncate text-base ${
                checkedToday
                  ? "text-[var(--text-muted)] line-through"
                  : "text-[var(--text)]"
              }`}
            >
              {item.title}
            </div>
            {subtitle ? (
              <div className="truncate text-sm text-[var(--text-soft)]">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
        <RowActions item={item} />
      </div>
    );
  }

  return (
    <ItemRow
      title={item.title}
      subtitle={subtitle ?? null}
      edit={{
        action: updateBoardItem,
        hiddenFields: { itemId: item.id },
        fields: [
          { name: "title", defaultValue: item.title },
          {
            name: "description",
            defaultValue: item.description ?? "",
            required: false,
          },
        ],
      }}
      remove={{
        action: deleteBoardItem,
        hiddenFields: { itemId: item.id },
      }}
    />
  );
}

function RowActions({ item }: { item: BoardItem }) {
  return (
    <div className="flex items-center gap-2">
      <details className="relative">
        <summary className="list-none cursor-pointer text-xs text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
          editar
        </summary>
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
          <form action={updateBoardItem} className="space-y-2">
            <input type="hidden" name="itemId" value={item.id} />
            <input
              name="title"
              defaultValue={item.title}
              required
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
            />
            <input
              name="description"
              defaultValue={item.description ?? ""}
              placeholder="Descricao"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
            >
              Salvar
            </button>
          </form>
          <form action={deleteBoardItem} className="mt-2">
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              className="w-full rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
            >
              Excluir
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
