import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 text-center">
      <div className="text-6xl mb-4">🤷</div>
      <h1 className="font-display text-3xl font-black uppercase mb-2">
        Evento no encontrado
      </h1>
      <p className="text-[var(--muted)] mb-6 max-w-sm">
        El link puede estar mal, o el evento fue borrado.
      </p>
      <Link href="/">
        <Button variant="secondary" size="lg">
          Ir al inicio
        </Button>
      </Link>
    </main>
  );
}
