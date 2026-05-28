import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseField =
  "w-full neo-border bg-[var(--surface)] text-[var(--ink)] px-3 py-2.5 rounded-md font-medium placeholder:text-[var(--muted)] focus:outline-none focus:neo-shadow-sm transition-shadow";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return <input ref={ref} className={`${baseField} ${className}`} {...rest} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", ...rest }, ref) {
    return <textarea ref={ref} className={`${baseField} min-h-[80px] resize-y ${className}`} {...rest} />;
  }
);

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--ink)]"
    >
      {children}
    </label>
  );
}
