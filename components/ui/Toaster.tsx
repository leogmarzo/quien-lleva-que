"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: number;
  message: string;
  variant?: "default" | "error";
};

let nextId = 1;
const listeners = new Set<(t: Toast) => void>();

export function toast(message: string, variant: Toast["variant"] = "default") {
  const t: Toast = { id: nextId++, message, variant };
  listeners.forEach((fn) => fn(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3000);
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`neo-border neo-shadow rounded-md px-4 py-2 font-bold text-sm ${
            t.variant === "error" ? "bg-[var(--taken)]" : "bg-[var(--accent)]"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
