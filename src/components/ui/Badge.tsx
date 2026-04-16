import { cn } from "@/lib/utils";

type BadgeVariant = "yellow" | "dark" | "outline" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  yellow: "bg-yellow text-navy font-black",
  dark: "border border-stroke bg-panel text-ink-soft",
  outline: "border border-stroke bg-paper text-ink-soft",
  success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border border-amber-200 bg-amber-50 text-amber-700",
  danger: "border border-red-200 bg-red-50 text-red-700",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = "dark", children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold leading-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
