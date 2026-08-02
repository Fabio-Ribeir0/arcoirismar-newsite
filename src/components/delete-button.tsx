"use client";

export function DeleteButton({
  action,
  confirmMessage = "Tem certeza que deseja excluir?",
  label = "Excluir",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
        {label}
      </button>
    </form>
  );
}
