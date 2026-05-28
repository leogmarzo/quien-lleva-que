import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg" | "sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-[var(--ink)] text-[var(--accent)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:2px_2px_0_var(--ink)]",
  secondary: "bg-[var(--accent)] text-[var(--ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:2px_2px_0_var(--ink)]",
  danger: "bg-[var(--taken)] text-[var(--ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:2px_2px_0_var(--ink)]",
  ghost: "bg-[var(--surface)] text-[var(--ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:2px_2px_0_var(--ink)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-13 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", fullWidth, className = "", children, ...rest },
  ref
) {
  const base =
    "neo-border neo-shadow font-bold uppercase tracking-wide rounded-md inline-flex items-center justify-center gap-2 transition-transform duration-75 active:translate-x-[4px] active:translate-y-[4px] active:neo-shadow-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

  return (
    <button
      ref={ref}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
