import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-maintix-surface text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl border border-white/10 bg-maintix-surfaceLight p-10 shadow-2xl shadow-black/20">
          {children}
        </div>
      </div>
    </main>
  );
}
