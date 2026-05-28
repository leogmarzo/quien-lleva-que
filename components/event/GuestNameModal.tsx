"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export function GuestNameModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");

  function submit() {
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    onSubmit(trimmed);
    setName("");
  }

  return (
    <Modal open={open} onClose={onClose} title="¿Cómo te llamás?">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-3"
      >
        <p className="text-sm text-[var(--muted)]">
          Lo guardamos en este dispositivo para que no lo pongas cada vez.
        </p>
        <div>
          <Label htmlFor="guest-name">Tu nombre</Label>
          <Input
            id="guest-name"
            placeholder="Juan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            maxLength={40}
          />
        </div>
        <Button type="submit" variant="primary" size="md" fullWidth>
          Listo
        </Button>
      </form>
    </Modal>
  );
}
