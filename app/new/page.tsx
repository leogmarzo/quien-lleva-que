import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewEventForm } from "@/components/event/NewEventForm";

export default async function NewEventPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login?next=/new");
  }

  return (
    <main className="min-h-dvh max-w-md mx-auto px-5 py-6 sm:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-bold text-sm uppercase mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <h1 className="font-display text-3xl font-black uppercase leading-tight mb-1">
        Nuevo evento
      </h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Después podés compartir el link con quien quieras.
      </p>

      <NewEventForm />
    </main>
  );
}
