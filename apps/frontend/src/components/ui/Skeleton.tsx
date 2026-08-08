import { HTMLAttributes } from 'react';

export function Skeleton(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="animate-pulse rounded-3xl bg-slate-700/60" {...props} />;
}
