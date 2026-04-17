import { cn } from "@/lib/utils";

// ── Table ────────────────────────────────────────────────────────────────────
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-stroke">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeadCell({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-soft",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-stroke">{children}</tbody>;
}

export function TableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-panel/60",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3.5 text-ink", className)}>{children}</td>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function TableEmpty({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="py-20 flex flex-col items-center gap-3 text-center">
          {icon && <div className="text-ink-muted">{icon}</div>}
          <p className="font-bold text-sm uppercase tracking-wide text-ink-soft">
            {title}
          </p>
          {description && (
            <p className="max-w-xs text-xs text-ink-muted">{description}</p>
          )}
        </div>
      </td>
    </tr>
  );
}
