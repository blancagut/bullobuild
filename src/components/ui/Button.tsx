import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "ghost" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-yellow hover:bg-yellow-dark text-ink font-black uppercase tracking-widest",
  outline:
    "border border-stroke bg-white text-ink font-bold uppercase tracking-wider hover:border-yellow/40 hover:bg-panel",
  ghost:
    "hover:bg-panel text-ink-soft hover:text-ink font-medium uppercase tracking-wide",
  secondary:
    "border border-stroke bg-white text-ink font-bold uppercase tracking-wider hover:bg-panel",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[11px] tracking-[0.16em] sm:px-5",
  md: "h-11 px-5 text-xs tracking-[0.16em] sm:px-6 sm:text-sm",
  lg: "h-12 px-6 text-sm tracking-[0.16em] sm:px-8",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  asChild?: boolean;
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
