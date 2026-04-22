"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push("/login");
          router.refresh();
        });
      }}
      className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:bg-white/70"
    >
      {isPending ? "Saindo..." : "Sair"}
    </button>
  );
}
