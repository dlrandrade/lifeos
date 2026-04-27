"use client";

import { useState } from "react";
import { CheckCircle2, Layers, ListChecks, Plus, Timer, Calendar, NotebookPen } from "lucide-react";
import { createBoard } from "@/server/actions";

const MODELS = [
  {
    value: "CHECKLIST",
    label: "Checklist",
    helper: "Lista com itens marcaveis (igual tarefa)",
    Icon: ListChecks,
  },
  {
    value: "CATALOG",
    label: "Catalogo",
    helper: "Itens com status (igual livro/filme)",
    Icon: Layers,
  },
  {
    value: "COUNTER",
    label: "Contador",
    helper: "Registros com valor numerico (igual hidratacao)",
    Icon: Timer,
  },
  {
    value: "SCHEDULE",
    label: "Agenda",
    helper: "Itens com data e hora (igual compromisso)",
    Icon: Calendar,
  },
  {
    value: "NOTE",
    label: "Notas",
    helper: "Itens livres com descricao",
    Icon: NotebookPen,
  },
] as const;

export function CreateBoardCard() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState<(typeof MODELS)[number]["value"] | null>(
    null,
  );
  const [name, setName] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="snap-start shrink-0 w-[140px] flex flex-col items-start rounded-[1.5rem] border-2 border-dashed border-[var(--check)] bg-transparent px-4 py-4 hover:bg-[var(--card)] transition"
      >
        <Plus className="h-5 w-5 text-[var(--text-soft)]" strokeWidth={1.7} />
        <span className="mt-8 truncate text-sm font-bold">Nova lista</span>
        <span className="truncate text-sm text-[var(--text-soft)]">criar</span>
      </button>
    );
  }

  if (!model) {
    return (
      <div className="snap-start shrink-0 w-[260px] rounded-[1.5rem] bg-[var(--card)] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Que modelo de lista?</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-[var(--text-muted)]"
          >
            cancelar
          </button>
        </div>
        <div className="mt-3 grid gap-2">
          {MODELS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setModel(m.value)}
              className="flex items-start gap-3 rounded-2xl bg-[var(--bg)] p-3 text-left hover:bg-[var(--shell)] transition"
            >
              <m.Icon className="h-5 w-5 mt-0.5" strokeWidth={1.7} />
              <div className="min-w-0">
                <p className="text-sm font-bold">{m.label}</p>
                <p className="text-xs text-[var(--text-soft)]">{m.helper}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="snap-start shrink-0 w-[260px] rounded-[1.5rem] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Nome da lista</p>
        <button
          type="button"
          onClick={() => {
            setModel(null);
            setName("");
          }}
          className="text-xs text-[var(--text-muted)]"
        >
          voltar
        </button>
      </div>

      <form action={createBoard} className="mt-3 space-y-2">
        <input type="hidden" name="model" value={model} />
        <input
          name="name"
          autoFocus
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Habitos, Receitas, Estudos..."
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Criar lista
        </button>
      </form>
    </div>
  );
}
