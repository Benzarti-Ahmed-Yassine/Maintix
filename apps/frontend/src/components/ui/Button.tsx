import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition';
  const classes =
    variant === 'secondary'
      ? `${base} bg-slate-700 text-slate-100 hover:bg-slate-600`
      : variant === 'ghost'
      ? `${base} bg-transparent text-maintix-primary hover:bg-white/5`
      : `${base} bg-maintix-primary text-slate-950 hover:bg-maintix-primary/90`;

  return <button className={`${classes} ${className}`} {...props} />;
}
