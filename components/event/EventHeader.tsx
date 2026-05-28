"use client";

import { Calendar } from "lucide-react";
import { formatEventDate } from "@/lib/dates";
import { ShareButton } from "./ShareButton";

type Props = {
  name: string;
  eventAt: string | null;
  description: string | null;
  shareUrl: string;
};

export function EventHeader({ name, eventAt, description, shareUrl }: Props) {
  const formatted = eventAt ? formatEventDate(eventAt) : null;

  return (
    <header className="mb-6">
      <h1 className="font-display text-3xl sm:text-4xl font-black uppercase leading-[0.95] tracking-tight mb-2">
        {name}
      </h1>

      {formatted ? (
        <div className="inline-flex items-center gap-1.5 bg-[var(--accent)] neo-border px-2.5 py-1 rounded-sm font-bold text-xs uppercase tracking-wide mb-3">
          <Calendar className="w-3.5 h-3.5" />
          {formatted}
        </div>
      ) : null}

      {description ? (
        <p className="text-sm leading-snug whitespace-pre-wrap text-[var(--ink)] mb-4">
          {description}
        </p>
      ) : null}

      <ShareButton url={shareUrl} eventName={name} />
    </header>
  );
}
