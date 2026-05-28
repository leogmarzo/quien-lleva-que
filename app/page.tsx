import Link from "next/link";
import { Plus, LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { EventCard } from "@/components/dashboard/EventCard";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return <Landing />;
  }

  const { data: events } = await supabase
    .from("events")
    .select("slug, name, event_at, description, created_at")
    .eq("owner_id", user.id)
    .order("event_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-5 py-6 sm:py-10">
      <header className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase leading-tight">
            Tus eventos
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Hola, {user.user_metadata?.name?.split(" ")[0] ?? user.email}.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="neo-border bg-[var(--surface)] rounded-md p-2 cursor-pointer"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </header>

      <Link href="/new" className="block mb-6">
        <Button variant="primary" size="lg" fullWidth>
          <Plus className="w-5 h-5" />
          Nuevo evento
        </Button>
      </Link>

      {events && events.length > 0 ? (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.slug}>
              <EventCard
                slug={e.slug}
                name={e.name}
                event_at={e.event_at}
                description={e.description}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="neo-border bg-[var(--surface)] rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-bold mb-1">Todavía no creaste ningún evento</p>
          <p className="text-sm text-[var(--muted)]">
            Tocá <strong>Nuevo evento</strong> arriba para empezar.
          </p>
        </div>
      )}
    </main>
  );
}

function Landing() {
  return (
    <main className="min-h-dvh flex flex-col">
      <section className="flex-1 max-w-2xl mx-auto px-5 py-10 sm:py-16 flex flex-col justify-center">
        <div className="text-6xl mb-6">🍖🔥🍷</div>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase leading-[0.95] tracking-tight mb-4">
          Quién lleva qué.
        </h1>
        <p className="text-lg leading-snug mb-8 max-w-md">
          Organizá quién lleva qué para un asado, un cumple, un picnic.
          Sin grupos de WhatsApp eternos.
        </p>

        <div className="space-y-3 max-w-sm">
          <Link href="/login?next=/new" className="block">
            <Button variant="secondary" size="lg" fullWidth>
              Crear un evento
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
          {[
            { emoji: "🔗", title: "1. Creás", body: "Le ponés nombre, fecha y listo." },
            { emoji: "📱", title: "2. Compartís", body: "Mandás el link por WhatsApp." },
            { emoji: "✅", title: "3. Cada uno se anota", body: "Sin login para los invitados." },
          ].map((step) => (
            <div
              key={step.title}
              className="neo-border bg-[var(--surface)] rounded-lg p-4"
            >
              <div className="text-2xl mb-1">{step.emoji}</div>
              <div className="font-display font-black text-sm uppercase">{step.title}</div>
              <div className="text-sm text-[var(--muted)] leading-snug">{step.body}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
