import { cn } from "@/lib/utils";

type BadgeVariant = "yellow" | "dark" | "outline" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  yellow: "bg-yellow text-navy font-black",
  dark: "bg-white/10 text-gray-300",
  outline: "border border-white/20 text-gray-400",
  success: "bg-emerald-900/50 text-emerald-400 border border-emerald-800",
  warning: "bg-amber-900/50 text-amber-400 border border-amber-800",
  danger: "bg-red-900/50 text-red-400 border border-red-800",
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
