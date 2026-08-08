import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-2xl border border-white/10 bg-maintix-surface placeholder:text-slate-500 px-4 py-3 text-sm text-white transition focus:border-maintix-primary focus:outline-none focus:ring-2 focus:ring-maintix-primary/20"
      {...props}
    />
  );
}
