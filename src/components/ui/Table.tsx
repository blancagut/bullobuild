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
    <thead className="border-b border-white/5">
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
        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-white/5">{children}</tbody>;
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
        "transition-colors hover:bg-white/[0.02]",
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
    <td className={cn("px-4 py-3.5 text-gray-300", className)}>{children}</td>
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
          {icon && <div className="text-gray-700">{icon}</div>}
          <p className="font-bold text-sm text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-600 max-w-xs">{description}</p>
          )}
        </div>
      </td>
    </tr>
  );
}
