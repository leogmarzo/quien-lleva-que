"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { updateEvent, deleteEvent } from "@/app/actions/events";
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/dates";

type Props = {
  slug: string;
  initialName: string;
  initialEventAt: string | null;
  initialDescription: string | null;
};

export function EditEventForm({
  slug,
  initialName,
  initialEventAt,
  initialDescription,
}: Props) {
  const [name, setName] = useState(initialName);
  const [eventAt, setEventAt] = useState(toDatetimeLocalValue(initialEventAt));
  const [description, setDescription] = useState(initialDescription ?? "");
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateEvent({
        slug,
        name,
        event_at: fromDatetimeLocalValue(eventAt),
        description: description.trim() || null,
      });
      if (result?.error) {
        toast(result.error, "error");
      } else {
        toast("Guardado");
      }
    });
  }

  function onDelete() {
    const confirmed = window.confirm(
      `¿Borrar el evento "${initialName}"? Se borran todos los items y nadie más va a poder entrar al link.`
    );
    if (!confirmed) return;
    startDelete(async () => {
      const result = await deleteEvent(slug);
      if (result?.error) toast(result.error, "error");
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="event_at">Fecha y hora</Label>
          <Input
            id="event_at"
            type="datetime-local"
            value={eventAt}
            onChange={(e) => setEventAt(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>

      <div className="neo-border rounded-lg p-4 bg-[var(--surface)]">
        <h3 className="font-display font-black uppercase text-sm mb-1">Zona peligrosa</h3>
        <p className="text-xs text-[var(--muted)] mb-3">
          Borrar el evento borra también todos los items y se invalida el link.
        </p>
        <Button
          type="button"
          variant="danger"
          size="md"
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Borrando..." : "Borrar evento"}
        </Button>
      </div>
    </div>
  );
}
