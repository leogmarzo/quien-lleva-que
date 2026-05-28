"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AddItemInput = {
  eventSlug: string;
  eventId: string;
  name: string;
  emoji: string;
  notes: string | null;
  guestName: string | null;
};

export async function addItem(input: AddItemInput) {
  const name = input.name.trim();
  if (!name) return { error: "Poné un nombre al item." };

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let insertRow: {
    event_id: string;
    name: string;
    emoji: string;
    notes: string | null;
    created_by_user_id?: string;
    created_by_guest_name?: string;
  } = {
    event_id: input.eventId,
    name,
    emoji: input.emoji || "📌",
    notes: input.notes && input.notes.trim().length > 0 ? input.notes.trim() : null,
  };

  if (user) {
    insertRow = { ...insertRow, created_by_user_id: user.id };
  } else {
    const guestName = (input.guestName ?? "").trim();
    if (!guestName) return { error: "Necesitamos saber cómo te llamás." };
    insertRow = { ...insertRow, created_by_guest_name: guestName };
  }

  const { error } = await supabase.from("items").insert(insertRow);
  if (error) return { error: error.message };

  revalidatePath(`/e/${input.eventSlug}`);
  return { ok: true };
}

type DeleteItemInput = {
  eventSlug: string;
  itemId: string;
  guestName: string | null;
};

export async function deleteItem(input: DeleteItemInput) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    const { error } = await supabase.from("items").delete().eq("id", input.itemId);
    if (error) return { error: error.message };
  } else {
    const guestName = (input.guestName ?? "").trim();
    if (!guestName) return { error: "No autorizado." };
    const { error } = await supabase.rpc("delete_item_as_guest", {
      p_item_id: input.itemId,
      p_guest_name: guestName,
    });
    if (error) return { error: error.message };
  }

  revalidatePath(`/e/${input.eventSlug}`);
  return { ok: true };
}
