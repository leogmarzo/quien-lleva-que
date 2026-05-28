"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const nanoid = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",
  8
);

type CreateEventInput = {
  name: string;
  event_at: string | null;
  description: string | null;
};

export async function createEvent(input: CreateEventInput) {
  const name = input.name.trim();
  if (!name) {
    return { error: "El nombre del evento es obligatorio." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return { error: "Tenés que estar logueado para crear un evento." };
  }

  // Retry a few times in the (extremely unlikely) case of a slug collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = nanoid();
    const { data, error } = await supabase
      .from("events")
      .insert({
        slug,
        name,
        event_at: input.event_at,
        description: input.description,
        owner_id: user.id,
      })
      .select("slug")
      .single();

    if (error) {
      if (error.code === "23505" /* unique_violation */) continue;
      return { error: error.message };
    }

    revalidatePath("/");
    redirect(`/e/${data.slug}`);
  }

  return { error: "No pudimos generar un link único. Intentá de nuevo." };
}

type UpdateEventInput = {
  slug: string;
  name: string;
  event_at: string | null;
  description: string | null;
};

export async function updateEvent(input: UpdateEventInput) {
  const name = input.name.trim();
  if (!name) return { error: "El nombre del evento es obligatorio." };

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "No autorizado." };

  const { error } = await supabase
    .from("events")
    .update({
      name,
      event_at: input.event_at,
      description: input.description,
    })
    .eq("slug", input.slug);

  if (error) return { error: error.message };

  revalidatePath(`/e/${input.slug}`);
  revalidatePath(`/e/${input.slug}/settings`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteEvent(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "No autorizado." };

  const { error } = await supabase.from("events").delete().eq("slug", slug);
  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/");
}
