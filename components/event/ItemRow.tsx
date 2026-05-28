"use client";

import { useTransition } from "react";
import { Trash2, Check, Plus } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { toast } from "@/components/ui/Toaster";
import type { ItemRow as Item, ClaimRow } from "@/lib/supabase/types";
import { claimItem, unclaimItem } from "@/app/actions/claims";
import { deleteItem } from "@/app/actions/items";

type Props = {
  item: Item;
  claims: ClaimRow[];
  eventSlug: string;
  currentUserId: string | null;
  guestName: string | null;
  onActionWithIdentity: (action: () => void) => void;
};

export function ItemRow({
  item,
  claims,
  eventSlug,
  currentUserId,
  guestName,
  onActionWithIdentity,
}: Props) {
  const [pending, startTransition] = useTransition();

  const myClaim = claims.find((c) =>
    currentUserId ? c.user_id === currentUserId : guestName && c.guest_name === guestName
  );
  const canDelete = currentUserId
    ? item.created_by_user_id === currentUserId
    : guestName !== null && item.created_by_guest_name === guestName;

  function onClaim() {
    onActionWithIdentity(() =>
      startTransition(async () => {
        const result = await claimItem({
          eventSlug,
          itemId: item.id,
          guestName,
        });
        if (result?.error) toast(result.error, "error");
      })
    );
  }

  function onUnclaim() {
    if (!myClaim) return;
    startTransition(async () => {
      const result = await unclaimItem({
        eventSlug,
        claimId: myClaim.id,
        guestName,
      });
      if (result?.error) toast(result.error, "error");
    });
  }

  function onDelete() {
    if (!confirm(`¿Borrar "${item.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteItem({
        eventSlug,
        itemId: item.id,
        guestName,
      });
      if (result?.error) toast(result.error, "error");
    });
  }

  const claimerNames = claims
    .map((c) =>
      c.user_id && currentUserId === c.user_id
        ? "Vos"
        : c.guest_name && guestName === c.guest_name
        ? "Vos"
        : c.guest_name
        ? c.guest_name
        : "Alguien"
    )
    .filter(Boolean);

  return (
    <div className="neo-border neo-shadow bg-[var(--surface)] rounded-md p-3 flex items-start gap-3">
      <div className="text-2xl leading-none pt-0.5 select-none">{item.emoji}</div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-[15px] leading-tight break-words">{item.name}</div>
        {item.notes ? (
          <div className="text-xs text-[var(--muted)] mt-0.5 break-words whitespace-pre-wrap">
            {item.notes}
          </div>
        ) : null}

        {claimerNames.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {claimerNames.map((n, i) => (
              <Pill key={i} variant="taken">
                {n}
              </Pill>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {myClaim ? (
          <button
            type="button"
            onClick={onUnclaim}
            disabled={pending}
            className="neo-border bg-[var(--avail)] rounded-md px-2.5 py-1 text-xs font-bold uppercase inline-flex items-center gap-1 active:translate-y-[1px] disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3 h-3" />
            Anotado
          </button>
        ) : (
          <button
            type="button"
            onClick={onClaim}
            disabled={pending}
            className="neo-border bg-[var(--accent)] rounded-md px-2.5 py-1 text-xs font-bold uppercase inline-flex items-center gap-1 neo-shadow-sm active:translate-y-[1px] active:neo-shadow-none disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Lo llevo
          </button>
        )}
        {canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="text-[var(--muted)] hover:text-[var(--ink)] p-1 cursor-pointer"
            aria-label="Borrar item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
