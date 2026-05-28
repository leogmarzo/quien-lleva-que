"use client";

import { useState, useTransition } from "react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { createEvent } from "@/app/actions/events";
import { fromDatetimeLocalValue } from "@/lib/dates";

export function NewEventForm() {
  const [name, setName] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast("Poné un nombre al evento", "error");
      return;
    }
    startTransition(async () => {
      const result = await createEvent({
        name,
        event_at: fromDatetimeLocalValue(eventAt),
        description: description.trim() || null,
      });
      if (result?.error) {
        toast(result.error, "error");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          placeholder="Asado en lo de Leo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="event_at">Fecha y hora (opcional)</Label>
        <Input
          id="event_at"
          name="event_at"
          type="datetime-local"
          value={eventAt}
          onChange={(e) => setEventAt(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Cómo llegar, detalles, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={pending}
      >
        {pending ? "Creando..." : "Crear evento"}
      </Button>
    </form>
  );
}
