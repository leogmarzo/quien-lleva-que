import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { formatEventDate } from "@/lib/dates";

type Props = {
  slug: string;
  name: string;
  event_at: string | null;
  description: string | null;
};

export function EventCard({ slug, name, event_at, description }: Props) {
  const formatted = event_at ? formatEventDate(event_at) : null;

  return (
    <Link
      href={`/e/${slug}`}
      className="group block neo-border neo-shadow bg-[var(--surface)] rounded-lg p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:neo-shadow-sm transition-transform duration-75"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-black text-lg uppercase leading-tight truncate">
            {name}
          </h3>
          {formatted ? (
            <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink)] mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatted}
            </div>
          ) : null}
          {description ? (
            <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">{description}</p>
          ) : null}
        </div>
        <ArrowRight className="w-5 h-5 shrink-0 mt-1" />
      </div>
    </Link>
  );
}
