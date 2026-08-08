import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'muted';
}

const classes: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-emerald-500/15 text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-300',
  danger: 'bg-rose-500/15 text-rose-300',
  muted: 'bg-slate-700/70 text-slate-200'
};

export function Badge({ children, variant = 'muted' }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${classes[variant]}`}>{children}</span>;
}
