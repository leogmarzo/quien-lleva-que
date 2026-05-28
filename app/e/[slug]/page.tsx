import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventClient } from "@/components/event/EventClient";
import type { ItemRow, ClaimRow } from "@/lib/supabase/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("events")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();
  return {
    title: data?.name ? `${data.name} · Quién Lleva Qué` : "Quién Lleva Qué",
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, slug, name, event_at, description, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError || !event) {
    notFound();
  }

  const [{ data: items }, { data: claims }, { data: userData }] = await Promise.all([
    supabase
      .from("items")
      .select(
        "id, event_id, name, emoji, notes, created_by_user_id, created_by_guest_name, created_at"
      )
      .eq("event_id", event.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("claims")
      .select("id, item_id, user_id, guest_name, created_at")
      .in(
        "item_id",
        (
          await supabase.from("items").select("id").eq("event_id", event.id)
        ).data?.map((i) => i.id) ?? []
      ),
    supabase.auth.getUser(),
  ]);

  const user = userData.user;
  const isOwner = !!user && user.id === event.owner_id;

  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-5 py-5 sm:py-8 pb-32">
      <nav className="flex items-center justify-between mb-5">
        <Link
          href={user ? "/" : "/login"}
          className="inline-flex items-center gap-1 font-bold text-sm uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> {user ? "Tus eventos" : "Entrar"}
        </Link>
        {isOwner ? (
          <Link
            href={`/e/${event.slug}/settings`}
            className="neo-border bg-[var(--surface)] rounded-md p-2"
            aria-label="Configurar evento"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
        ) : null}
      </nav>

      <EventClient
        event={event}
        initialItems={(items as ItemRow[]) ?? []}
        initialClaims={(claims as ClaimRow[]) ?? []}
        currentUserId={user?.id ?? null}
      />
    </main>
  );
}
