import { ActionFormButton } from "@/components/action-form-button";

type TaskListCardProps = {
  tasks: Array<{ id: string; title: string; completed: boolean }>;
  toggleAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
};

export function TaskListCard({ tasks, toggleAction, deleteAction }: TaskListCardProps) {
  return (
    <div className="mt-8 grid gap-3">
      {tasks.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 rounded-[1.35rem] bg-white px-4 py-3"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                item.completed
                  ? "border-[#161616] bg-[#161616] text-[#f8f3eb]"
                  : "border-line bg-[#f3eee6] text-muted"
              }`}
            >
              ✓
            </div>
            <span className="text-base text-[#504b45] sm:text-lg">{item.title}</span>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <ActionFormButton
              action={toggleAction}
              hiddenFields={{ taskId: item.id }}
              label={item.completed ? "Desmarcar" : "Concluir"}
              tone={item.completed ? "default" : "dark"}
            />
            <ActionFormButton
              action={deleteAction}
              hiddenFields={{ taskId: item.id }}
              label="Excluir"
              tone="danger"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
