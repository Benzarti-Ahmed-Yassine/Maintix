import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { fetchConnectedSystems } from '@/services/mockApi';

export function ConnectedSystemsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['connectedSystems'], queryFn: fetchConnectedSystems });

  return (
    <div className="space-y-6">
      <Panel title="Connected Systems" subtitle="ERP, MES, CMMS, SCADA and IoT connectors in one control plane">
        <div className="rounded-3xl bg-maintix-surfaceLight p-6 text-slate-200">
          {isLoading ? (
            <p className="text-slate-400">Loading system status…</p>
          ) : (
            <div className="space-y-4">
              {data?.map((system) => (
                <div key={system.id} className="rounded-3xl border border-white/10 bg-maintix-surface p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{system.name}</p>
                      <p className="text-sm text-slate-400">{system.connector}</p>
                    </div>
                    <Badge variant={system.status === 'Healthy' ? 'success' : system.status === 'Warning' ? 'warning' : 'danger'}>{system.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Latency: {system.latency}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
