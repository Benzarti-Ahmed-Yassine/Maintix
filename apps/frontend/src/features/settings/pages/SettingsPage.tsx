import { useState } from 'react';
import { useThemeStore } from '@/contexts/themeStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';

export function SettingsPage() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertsOn, setAlertsOn] = useState(true);

  return (
    <div className="space-y-6">
      <Panel title="Settings" subtitle="Configure users, systems and AI preferences">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-3xl bg-maintix-surfaceLight p-6 text-slate-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Theme</h3>
                  <p className="text-sm text-slate-400">Switch the visual mode for desktop and control-room settings.</p>
                </div>
                <Button variant="secondary" onClick={toggleTheme}>
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </Button>
              </div>
              <Badge variant={theme === 'dark' ? 'muted' : 'success'}>{theme.toUpperCase()}</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Auto-refresh</h3>
                  <p className="text-sm text-slate-400">Keep dashboards and alerts updated automatically.</p>
                </div>
                <Button variant={autoRefresh ? 'primary' : 'ghost'} onClick={() => setAutoRefresh((current) => !current)}>
                  {autoRefresh ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <p className="text-sm text-slate-400">Control alert delivery and event priority behavior.</p>
                </div>
                <Button variant={alertsOn ? 'primary' : 'ghost'} onClick={() => setAlertsOn((current) => !current)}>
                  {alertsOn ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 text-slate-300">
            <h3 className="text-lg font-semibold text-white">System integrations</h3>
            <p className="mt-3 text-sm text-slate-400">Validate connector health, tune sync intervals, and manage role-based access for enterprise systems.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
