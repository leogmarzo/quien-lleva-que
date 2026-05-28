"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

function LoginInner() {
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [loading, setLoading] = useState(false);

  async function loginWithGoogle() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirect },
    });
    if (error) {
      setLoading(false);
      alert(error.message);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5">
      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1 font-bold text-sm uppercase"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🍖</div>
        <h1 className="font-display text-3xl font-black uppercase leading-tight mb-2">
          Entrá para organizar
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8">
          Necesitamos saber quién creó el evento. Para anotarte a llevar algo
          en un evento existente, no hace falta loguearse.
        </p>

        <Button
          onClick={loginWithGoogle}
          disabled={loading}
          variant="secondary"
          size="lg"
          fullWidth
        >
          {loading ? "Redirigiendo..." : "Continuar con Google"}
        </Button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
