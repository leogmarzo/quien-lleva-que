"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ClaimInsert = Database["public"]["Tables"]["claims"]["Insert"];

type ClaimInput = {
  eventSlug: string;
  itemId: string;
  guestName: string | null;
};

export async function claimItem(input: ClaimInput) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let insertRow: ClaimInsert;
  if (user) {
    insertRow = {
      item_id: input.itemId,
      user_id: user.id,
      guest_name: null,
    };
  } else {
    const guestName = (input.guestName ?? "").trim();
    if (!guestName) {
      return { error: "Necesitamos saber cómo te llamás." };
    }
    insertRow = {
      item_id: input.itemId,
      user_id: null,
      guest_name: guestName,
    };
  }

  const { error } = await supabase.from("claims").insert(insertRow);
  if (error) {
    if (error.code === "23505") {
      // Already claimed this item — treat as success.
      revalidatePath(`/e/${input.eventSlug}`);
      return { ok: true };
    }
    return { error: error.message };
  }

  revalidatePath(`/e/${input.eventSlug}`);
  return { ok: true };
}

type UnclaimInput = {
  eventSlug: string;
  claimId: string;
  guestName: string | null;
};

export async function unclaimItem(input: UnclaimInput) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    const { error } = await supabase.from("claims").delete().eq("id", input.claimId);
    if (error) return { error: error.message };
  } else {
    const guestName = (input.guestName ?? "").trim();
    if (!guestName) return { error: "No autorizado." };
    const { error } = await supabase.rpc("delete_claim_as_guest", {
      p_claim_id: input.claimId,
      p_guest_name: guestName,
    });
    if (error) return { error: error.message };
  }

  revalidatePath(`/e/${input.eventSlug}`);
  return { ok: true };
}
