import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/contexts/authStore';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-maintix-surface px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Decision Intelligence</p>
        <h1 className="text-2xl font-semibold text-white">Operations Command</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          <p className="font-medium text-white">{user?.name ?? 'Operator'}</p>
          <p className="text-xs text-slate-400">{user?.role ?? 'Guest'}</p>
        </div>
        <Button variant="ghost" onClick={handleSignOut} className="rounded-2xl border border-white/10 px-3 py-2 text-xs">
          Sign out
        </Button>
      </div>
    </header>
  );
}
