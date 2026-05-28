import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditEventForm } from "@/components/event/EditEventForm";

type Props = { params: Promise<{ slug: string }> };

export default async function SettingsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/e/${slug}/settings`);

  const { data: event } = await supabase
    .from("events")
    .select("id, slug, name, event_at, description, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) notFound();
  if (event.owner_id !== userData.user.id) notFound();

  return (
    <main className="min-h-dvh max-w-md mx-auto px-5 py-6 sm:py-10">
      <Link
        href={`/e/${slug}`}
        className="inline-flex items-center gap-1 font-bold text-sm uppercase mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al evento
      </Link>

      <h1 className="font-display text-3xl font-black uppercase leading-tight mb-6">
        Configuración
      </h1>

      <EditEventForm
        slug={event.slug}
        initialName={event.name}
        initialEventAt={event.event_at}
        initialDescription={event.description}
      />
    </main>
  );
}
