import { logoutAction } from "@/app/logout-action";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-md border border-line px-4 py-2 text-sm font-medium text-primary transition hover:bg-mist"
      >
        Sair
      </button>
    </form>
  );
}
