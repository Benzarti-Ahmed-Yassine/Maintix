import { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <article className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/40">
      <h3 className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-500">{title}</h3>
      <div>{children}</div>
    </article>
  );
}
