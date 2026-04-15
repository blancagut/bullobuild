import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  align = "left",
  className,
  action,
}: SectionHeaderProps) {
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
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#F2B705] mb-2">
            {label}
          </span>
        )}
        <h2
          className="text-3xl md:text-4xl font-black uppercase text-white leading-none tracking-tight"
          style={{ fontFamily: "var(--font-barlow), system-ui" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-400 text-sm mt-2 max-w-xl">{subtitle}</p>
        )}
      </div>
      {action && align !== "center" && <div className="shrink-0">{action}</div>}
    </div>
  );
}
