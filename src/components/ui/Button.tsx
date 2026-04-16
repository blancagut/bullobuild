import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "ghost" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-yellow hover:bg-yellow-dark text-ink font-black uppercase tracking-widest",
  outline:
    "border border-white/30 hover:border-white text-white font-bold uppercase tracking-wider",
  ghost:
    "hover:bg-white/5 text-gray-300 hover:text-white font-medium uppercase tracking-wide",
  secondary:
    "bg-white/10 hover:bg-white/15 text-white font-bold uppercase tracking-wider",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-xs px-4 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-sm px-8 py-4",
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
    "inline-flex items-center justify-center gap-2 transition-colors cursor-pointer select-none",
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
