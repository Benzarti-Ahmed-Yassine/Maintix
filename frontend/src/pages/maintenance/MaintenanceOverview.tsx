import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CalendarDays, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useStore.js';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { useMaintenanceOverview } from '../../hooks/useMaintenanceData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const MaintenanceOverview: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedMachineCode, liveConnected } = useAppStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useMaintenanceOverview();

  const metrics = data?.metrics || {
    totalMachines: 0,
    criticalAlerts: 0,
    highRiskCount: 0,
    plannedTasksCount: 0,
    mtbfHours: null,
    mttrHours: null
  };

  const riskRanking = data?.riskRanking || [];
  const maintenancePlans = data?.maintenancePlans || [];
  const downtimeTrend = data?.downtimeTrend || [];
  const failureCauses = data?.failureCauses || [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner with Live/Refresh Indicator */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">Maintenance Operations & Reliability Hub</h2>
          <p className="text-xs text-slate-400">All KPIs and risk rankings computed dynamically from backend database</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${liveConnected ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'}`}>
            ● {liveConnected ? 'Live API' : 'Cached'}
          </span>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && (!riskRanking || riskRanking.length === 0)}
        emptyTitle="No Maintenance Records Found"
        emptyMessage="No machines or work orders currently exist in the database. Add machines from the Admin panel."
        onRetry={() => refetch()}
      >
        {/* Top 6 KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="industrial-card p-4 text-center cursor-pointer hover:border-slate-600" onClick={() => navigate('/maintenance/machines')}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Machines</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.totalMachines}</p>
          </div>

          <div className="industrial-card p-4 text-center border-red-900/60 cursor-pointer hover:border-red-500" onClick={() => navigate('/maintenance/risks')}>
            <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-1">Critical Alerts</p>
            <p className="text-3xl font-black text-red-500 font-mono">{metrics.criticalAlerts}</p>
          </div>

          <div className="industrial-card p-4 text-center border-amber-900/60 cursor-pointer hover:border-amber-500" onClick={() => navigate('/maintenance/risks')}>
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">High Risk</p>
            <p className="text-3xl font-black text-amber-500 font-mono">{metrics.highRiskCount}</p>
          </div>

          <div className="industrial-card p-4 text-center cursor-pointer hover:border-slate-600" onClick={() => navigate('/maintenance/plans')}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Planned Tasks</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.plannedTasksCount}</p>
          </div>

          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">MTBF</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.mtbfHours !== null ? `${metrics.mtbfHours}h` : 'N/A'}</p>
          </div>

          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">MTTR</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.mttrHours !== null ? `${metrics.mttrHours}h` : 'N/A'}</p>
          </div>

        </div>

        {/* Main Grid: Risk Ranking & Maintenance Plan Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Risk Ranking Table Card (Left) */}
          <div className="industrial-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-400" /> Machine Risk Ranking
              </h3>
              <button onClick={() => navigate('/maintenance/risks')} className="text-xs text-blue-400 hover:underline">
                View all machines →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Machine ID</th>
                    <th className="pb-2">Risk Score</th>
                    <th className="pb-2">RUL</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {riskRanking.map((r: any, i: number) => (
                    <tr
                      key={r.machineId || i}
                      className="hover:bg-slate-900/60 cursor-pointer transition"
                      onClick={() => {
                        setSelectedMachineCode(r.machineId);
                        navigate(`/technician/machines/${r.machineId}`);
                      }}
                    >
                      <td className="py-2.5 text-slate-400 font-bold">{r.rank || i + 1}</td>
                      <td className="py-2.5 font-bold text-white">{r.machineId}</td>
                      <td className="py-2.5 font-bold text-red-500">{r.riskScore}%</td>
                      <td className="py-2.5 text-slate-300">{r.rulDays} days</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                          r.status === 'CRITICAL'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : r.status === 'WARNING' || r.status === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maintenance Plan Gantt Timeline Card (Middle - 2 cols) */}
          <div className="industrial-card p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <CalendarDays size={16} className="text-teal-400" /> Active Maintenance Schedule
              </h3>
              <button onClick={() => navigate('/maintenance/plans')} className="text-xs text-teal-400 hover:underline">
                Full Schedule →
              </button>
            </div>

            {maintenancePlans.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No maintenance tasks currently planned.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {maintenancePlans.slice(0, 5).map((plan: any, idx: number) => (
                  <div key={plan.id || idx} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-mono font-bold text-white">{plan.machineCode}</span>
                    <div className="flex-1 bg-slate-900 h-7 rounded relative flex items-center px-2 border border-slate-800">
                      <div
                        className={`h-5 rounded text-[10px] font-bold text-white flex items-center justify-center px-2 shadow ${
                          plan.priority === 'CRITICAL'
                            ? 'bg-red-600/80 border border-red-400 w-[55%]'
                            : plan.priority === 'HIGH'
                            ? 'bg-amber-600/80 border border-amber-400 w-[45%]'
                            : 'bg-emerald-600/80 border border-emerald-400 w-[35%]'
                        }`}
                      >
                        {plan.title} ({new Date(plan.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bottom 3 Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Downtime Trend (hrs) Line Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Downtime Trend (hrs)</h3>
            <div className="h-44 w-full">
              {downtimeTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={downtimeTrend}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="hours" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No downtime history</div>
              )}
            </div>
          </div>

          {/* MTBF vs MTTR Bar Chart (derived from metrics) */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Reliability MTBF vs MTTR</h3>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { metric: 'MTBF (hrs)', value: metrics.mtbfHours || 0, fill: '#2563eb' },
                  { metric: 'MTTR (hrs)', value: metrics.mttrHours || 0, fill: '#f97316' }
                ]}>
                  <XAxis dataKey="metric" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Failure Causes Pie Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Top Failure Causes</h3>
            <div className="h-44 w-full flex items-center justify-center">
              {failureCauses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={failureCauses} dataKey="percentage" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                      {failureCauses.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No anomaly history</div>
              )}
            </div>
          </div>

        </div>
      </QueryStateWrapper>
    </div>
  );
};
