"use client";

import { useMemo } from "react";
import type { ItemRow, ClaimRow } from "@/lib/supabase/types";
import { ItemRow as ItemRowComp } from "./ItemRow";

type Props = {
  items: ItemRow[];
  claims: ClaimRow[];
  eventSlug: string;
  currentUserId: string | null;
  guestName: string | null;
  onActionWithIdentity: (action: () => void) => void;
};

export function ItemList({
  items,
  claims,
  eventSlug,
  currentUserId,
  guestName,
  onActionWithIdentity,
}: Props) {
  const claimsByItem = useMemo(() => {
    const m = new Map<string, ClaimRow[]>();
    for (const c of claims) {
      const arr = m.get(c.item_id) ?? [];
      arr.push(c);
      m.set(c.item_id, arr);
    }
    return m;
  }, [claims]);

  const available: ItemRow[] = [];
  const taken: ItemRow[] = [];
  for (const item of items) {
    const list = claimsByItem.get(item.id) ?? [];
    if (list.length === 0) available.push(item);
    else taken.push(item);
  }

  if (items.length === 0) {
    return (
      <div className="neo-border bg-[var(--surface)] rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">🤔</div>
        <p className="font-bold mb-1">Todavía no hay nada en la lista</p>
        <p className="text-sm text-[var(--muted)]">
          Tocá <strong>Sugerir algo</strong> abajo para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {available.length > 0 ? (
        <section>
          <h2 className="font-display font-black uppercase text-xs tracking-widest mb-2">
            Falta llevar · {available.length}
          </h2>
          <ul className="space-y-2.5">
            {available.map((item) => (
              <li key={item.id}>
                <ItemRowComp
                  item={item}
                  claims={[]}
                  eventSlug={eventSlug}
                  currentUserId={currentUserId}
                  guestName={guestName}
                  onActionWithIdentity={onActionWithIdentity}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {taken.length > 0 ? (
        <section>
          <h2 className="font-display font-black uppercase text-xs tracking-widest mb-2">
            Ya lo llevan · {taken.length}
          </h2>
          <ul className="space-y-2.5">
            {taken.map((item) => (
              <li key={item.id}>
                <ItemRowComp
                  item={item}
                  claims={claimsByItem.get(item.id) ?? []}
                  eventSlug={eventSlug}
                  currentUserId={currentUserId}
                  guestName={guestName}
                  onActionWithIdentity={onActionWithIdentity}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
