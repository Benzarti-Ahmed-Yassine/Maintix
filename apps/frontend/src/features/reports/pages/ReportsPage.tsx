import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { fetchReportsSummary } from '@/services/mockApi';

export function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['reportsSummary'], queryFn: fetchReportsSummary });

  return (
    <div className="space-y-6">
      <Panel title="Reports" subtitle="Generate and review operational intelligence and compliance reports">
        <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="rounded-3xl bg-maintix-surfaceLight p-6 text-slate-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Quick reporting</h3>
                  <p className="text-sm text-slate-400">Run scheduled and on-demand operations reports.</p>
                </div>
                <Button variant="secondary">New report</Button>
              </div>
              <div className="space-y-4">
                {isLoading
                  ? <p>Loading summaries…</p>
                  : data?.map((report) => (
                      <div key={report.id} className="rounded-3xl border border-white/10 bg-maintix-surface p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{report.name}</p>
                            <p className="text-sm text-slate-400">{report.team}</p>
                          </div>
                          <Badge variant={report.status === 'Ready' ? 'success' : report.status === 'Pending' ? 'warning' : 'muted'}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">Published {report.published}</p>
                      </div>
                    ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white/5 p-6 text-slate-300">
            <h3 className="mb-4 text-lg font-semibold text-white">Report builder</h3>
            <p className="text-sm">Create consolidated reporting for maintenance, throughput, and compliance.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
