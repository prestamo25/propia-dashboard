"use client";

import { useTransition } from "react";
import { blockBroker, unblockBroker } from "@/app/actions";

export function BlockButton({
  id,
  name,
  blocked,
  size = "sm",
}: {
  id: string;
  name: string | null;
  blocked: boolean;
  size?: "sm" | "md";
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (blocked) {
      startTransition(async () => {
        const res = await unblockBroker(id);
        if (res?.error) alert(res.error);
      });
    } else {
      const ok = window.confirm(
        `¿Bloquear a ${name ?? "este broker"}?\n\nNo podrá iniciar sesión ni entrar a la app.`,
      );
      if (!ok) return;
      startTransition(async () => {
        const res = await blockBroker(id);
        if (res?.error) alert(res.error);
      });
    }
  }

  const pad = size === "md" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={`rounded-lg font-medium ring-1 ring-inset transition disabled:opacity-50 ${pad} ${
        blocked
          ? "text-emerald-700 ring-emerald-200 hover:bg-emerald-50"
          : "text-rose-600 ring-rose-200 hover:bg-rose-50"
      }`}
    >
      {pending ? "…" : blocked ? "Reactivar" : "Bloquear"}
    </button>
  );
}
