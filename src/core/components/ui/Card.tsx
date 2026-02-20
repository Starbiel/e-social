import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_15px_70px_-40px_rgba(15,23,42,0.9)] backdrop-blur ${className}`}
    >
      {(title || actions || subtitle) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            )}
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              {actions}
            </div>
          )}
        </header>
      )}
      <div className="text-slate-100">{children}</div>
    </section>
  );
}
