"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EventRow, ItemRow, ClaimRow } from "@/lib/supabase/types";
import { EventHeader } from "./EventHeader";
import { ItemList } from "./ItemList";
import { AddItemSheet } from "./AddItemSheet";
import { GuestNameModal } from "./GuestNameModal";
import { getGuestName, setGuestName as persistGuestName } from "@/lib/guest";

type Props = {
  event: Pick<EventRow, "id" | "slug" | "name" | "event_at" | "description" | "owner_id">;
  initialItems: ItemRow[];
  initialClaims: ClaimRow[];
  currentUserId: string | null;
};

export function EventClient({ event, initialItems, initialClaims, currentUserId }: Props) {
  const [items, setItems] = useState<ItemRow[]>(initialItems);
  const [claims, setClaims] = useState<ClaimRow[]>(initialClaims);

  // Guest identity (null if logged in)
  const [guestName, setGuestNameState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  // Action queued behind the guest-name prompt
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Hydrate from localStorage after mount; localStorage doesn't exist during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestNameState(getGuestName());
    setHydrated(true);
  }, []);

  // ---------- Realtime ----------
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`event:${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items", filter: `event_id=eq.${event.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems((prev) => mergeUnique(prev, payload.new as ItemRow));
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id?: string };
            if (oldRow.id) {
              setItems((prev) => prev.filter((i) => i.id !== oldRow.id));
            }
          } else if (payload.eventType === "UPDATE") {
            const newRow = payload.new as ItemRow;
            setItems((prev) => prev.map((i) => (i.id === newRow.id ? newRow : i)));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "claims" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as ClaimRow;
            // Filter to this event by checking we know the item
            setClaims((prev) =>
              prev.some((c) => c.id === row.id) ? prev : [...prev, row]
            );
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id?: string };
            if (oldRow.id) {
              setClaims((prev) => prev.filter((c) => c.id !== oldRow.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  const eventItemIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  // Drop any claims that belong to items not in this event (handles startup edge cases)
  const scopedClaims = useMemo(
    () => claims.filter((c) => eventItemIds.has(c.item_id)),
    [claims, eventItemIds]
  );

  function ensureIdentityThen(action: () => void) {
    if (currentUserId) {
      action();
      return;
    }
    if (guestName) {
      action();
      return;
    }
    setPendingAction(() => action);
    setShowGuestModal(true);
  }

  function onGuestNameSubmit(name: string) {
    persistGuestName(name);
    setGuestNameState(name);
    setShowGuestModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }

  return (
    <>
      <EventHeader
        name={event.name}
        eventAt={event.event_at}
        description={event.description}
        shareUrl={hydrated ? window.location.href : ""}
      />

      <ItemList
        items={items}
        claims={scopedClaims}
        eventSlug={event.slug}
        currentUserId={currentUserId}
        guestName={guestName}
        onActionWithIdentity={ensureIdentityThen}
      />

      {/* Sticky add-item button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none px-5 pb-5">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button
            onClick={() => ensureIdentityThen(() => setShowAdd(true))}
            className="w-full neo-border neo-shadow-lg rounded-lg h-14 bg-[var(--ink)] text-[var(--accent)] font-display font-black uppercase text-base tracking-wider inline-flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:neo-shadow"
          >
            <Plus className="w-5 h-5" />
            Sugerir algo
          </button>
        </div>
      </div>

      <AddItemSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        eventId={event.id}
        eventSlug={event.slug}
        guestName={guestName}
      />

      <GuestNameModal
        open={showGuestModal}
        onClose={() => {
          setShowGuestModal(false);
          setPendingAction(null);
        }}
        onSubmit={onGuestNameSubmit}
      />
    </>
  );
}

function mergeUnique(prev: ItemRow[], row: ItemRow): ItemRow[] {
  if (prev.some((i) => i.id === row.id)) return prev;
  // Maintain insertion order by created_at asc
  const next = [...prev, row];
  next.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return next;
}
