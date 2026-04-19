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
        "flex flex-col gap-4 sm:gap-5",
        align === "left" && "sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div className={cn("min-w-0", align === "center" && "flex flex-col items-center")}>
        {label && (
          <span
            className={cn(
              "mb-2 inline-block text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs",
              isLight ? "text-yellow-dark" : "text-[#F2B705]"
            )}
          >
            {label}
          </span>
        )}
        <h2
          className={cn(
            "font-display text-[2.15rem] font-black uppercase leading-[0.92] tracking-tight sm:text-3xl md:text-4xl",
            isLight ? "text-ink" : "text-white"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-3 max-w-xl text-sm leading-relaxed sm:text-[15px]",
              isLight ? "text-ink-soft" : "text-gray-400"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && align !== "center" && (
        <div className="w-full shrink-0 sm:w-auto">
          <div className="flex sm:block">
            {action}
          </div>
        </div>
      )}
    </div>
  );
}
