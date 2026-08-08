import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Panel } from '@/components/ui/Panel';
import { fetchDashboardOverview } from '@/services/mockApi';
import { DemoSnapshot, runDemoPipeline, useActiveRole } from '@/services/demoPipeline';

export function DashboardPage() {
  const navigate = useNavigate();
  const activeRole = useActiveRole();
  const { data, isLoading } = useQuery({ queryKey: ['dashboardOverview'], queryFn: fetchDashboardOverview });
  const [demoData, setDemoData] = useState<DemoSnapshot | null>(null);

  useEffect(() => {
    let ignore = false;
    void runDemoPipeline(activeRole).then((snapshot) => {
      if (!ignore) setDemoData(snapshot);
    });
    return () => {
      ignore = true;
    };
  }, [activeRole]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-sky-500/20 bg-gradient-to-br from-sky-500/12 via-cyan-500/8 to-transparent p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Enterprise dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold">Operational command center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Executive view across production, maintenance and service operations with shared decision context.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">System health 94%</span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Last sync 2 min ago</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <Panel title="Executive overview" subtitle="Live decision intelligence for operations leaders">
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.topMetrics ?? []).map((metric) => (
              <Card key={metric.title} title={metric.title}>
                <p className="text-sm text-slate-500 dark:text-slate-300">{metric.description}</p>
                <p className="mt-4 text-3xl font-semibold">{metric.value}</p>
              </Card>
            ))}
          </div>
          {demoData && (
            <div className="mt-5 rounded-3xl border border-sky-500/20 bg-sky-500/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-600">Demo pipeline</p>
                  <p className="mt-1 text-sm">{demoData.summary}</p>
                </div>
                <Badge variant="muted">{demoData.status}</Badge>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {demoData.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-lg font-semibold">{metric.value}</p>
                    {metric.delta && <p className="text-xs text-slate-500">{metric.delta}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Priority alerts" subtitle="Operational issues requiring attention">
          <div className="space-y-3 text-sm">
            {(data?.activeAlerts ?? []).map((alert) => (
              <div key={alert.id} className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{alert.title}</p>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'muted'}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{alert.details}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{alert.timestamp}</p>
              </div>
            ))}
            {demoData?.alerts.map((alert) => (
              <button
                key={alert.title}
                onClick={() => navigate(demoData.featureLinks[0].path)}
                className="w-full rounded-3xl border border-slate-200/70 bg-white/70 p-4 text-left backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{alert.title}</p>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'muted'}>{alert.severity}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{alert.detail}</p>
              </button>
            ))}
          </div>
        </Panel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Production performance" subtitle="Hourly OEE and backlog forecast">
          <div className="grid gap-6">
            <div className="rounded-3xl bg-maintix-surface p-5">
              {isLoading ? (
                <p className="text-slate-500">Loading charts…</p>
              ) : (
                <LineChart
                  labels={data?.oeeLabels ?? []}
                  datasets={[
                    {
                      label: 'OEE',
                      data: data?.oeeValues ?? [],
                      borderColor: '#38BDF8',
                      backgroundColor: 'rgba(56,189,248,0.18)',
                      fill: true,
                      tension: 0.35
                    }
                  ]}
                />
              )}
            </div>
            <div className="rounded-3xl bg-maintix-surface p-5">
              {isLoading ? (
                <p className="text-slate-500">Loading backlog…</p>
              ) : (
                <BarChart
                  labels={data?.backlogLabels ?? []}
                  datasets={[
                    {
                      label: 'Backlog',
                      data: data?.backlogValues ?? [],
                      backgroundColor: '#22C55E'
                    }
                  ]}
                />
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Role launchpad" subtitle="Switch directly into the most relevant operational view">
          <div className="space-y-3">
            {demoData?.featureLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-left backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-950/40"
              >
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </button>
            ))}
          </div>
        </Panel>
      </motion.div>
    </div>
  );
}
