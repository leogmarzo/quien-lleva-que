"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--surface)] neo-border neo-shadow-lg rounded-lg p-5 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-display text-xl font-black uppercase leading-tight pr-8">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="neo-border bg-[var(--bg)] rounded-md p-1.5 cursor-pointer active:translate-y-[1px]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
