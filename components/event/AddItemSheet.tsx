"use client";

import { useMemo, useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { suggestEmoji } from "@/lib/emoji-suggest";
import { addItem } from "@/app/actions/items";

type Props = {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventSlug: string;
  guestName: string | null;
};

export function AddItemSheet(props: Props) {
  // Remounting on each open via `key` resets internal state cleanly,
  // and lets the form be authored without an effect-driven reset.
  return props.open ? (
    <AddItemSheetInner {...props} key={String(props.open)} />
  ) : null;
}

function AddItemSheetInner({ open, onClose, eventId, eventSlug, guestName }: Props) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const emoji = useMemo(() => suggestEmoji(name), [name]);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Poné un nombre al item", "error");
      return;
    }
    startTransition(async () => {
      const result = await addItem({
        eventId,
        eventSlug,
        name: trimmed,
        emoji,
        notes: notes.trim() || null,
        guestName,
      });
      if (result?.error) {
        toast(result.error, "error");
      } else {
        onClose();
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar a la lista">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="item-name">Qué llevar</Label>
          <div className="flex items-stretch gap-2">
            <div className="neo-border rounded-md bg-[var(--bg)] w-12 h-12 inline-flex items-center justify-center text-2xl shrink-0">
              {emoji}
            </div>
            <Input
              id="item-name"
              placeholder="Carne, vino, hielo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="h-12"
            />
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5">
            El emoji se autocompleta según lo que escribas.
          </p>
        </div>

        <div>
          <Label htmlFor="item-notes">Nota (opcional)</Label>
          <Textarea
            id="item-notes"
            placeholder="Sin sal, para los nenes, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={pending}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={pending} className="flex-1">
            {pending ? "Agregando..." : "Agregar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
