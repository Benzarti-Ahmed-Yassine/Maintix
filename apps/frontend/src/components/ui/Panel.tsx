import { ReactNode } from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white/70 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/40">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
