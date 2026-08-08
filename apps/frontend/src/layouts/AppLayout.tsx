import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { useThemeStore } from '@/contexts/themeStore';

export function AppLayout() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--app-bg)', color: 'var(--app-text)', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
}
