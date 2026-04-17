import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  align = "left",
  tone = "light",
  className,
  action,
}: SectionHeaderProps) {
  const isLight = tone === "light";

  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div>
        {label && (
          <span
            className={cn(
              "mb-2 inline-block text-xs font-bold uppercase tracking-[0.15em]",
              isLight ? "text-yellow-dark" : "text-[#F2B705]"
            )}
          >
            {label}
          </span>
        )}
        <h2
          className={cn(
            "font-display text-3xl font-black uppercase leading-none tracking-tight md:text-4xl",
            isLight ? "text-ink" : "text-white"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("mt-2 max-w-xl text-sm", isLight ? "text-ink-soft" : "text-gray-400")}>{subtitle}</p>
        )}
      </div>
      {action && align !== "center" && <div className="shrink-0">{action}</div>}
    </div>
  );
}
