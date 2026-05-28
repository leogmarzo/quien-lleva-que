type Variant = "avail" | "taken" | "neutral" | "accent";

const variantClasses: Record<Variant, string> = {
  avail: "bg-[var(--avail)]",
  taken: "bg-[var(--taken)]",
  neutral: "bg-[var(--surface)]",
  accent: "bg-[var(--accent)]",
};

export function Pill({
  children,
  variant = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] leading-none font-bold uppercase tracking-wider px-2 py-1 neo-border rounded-sm text-[var(--ink)] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
