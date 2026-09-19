import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, AlertCircle, Bot, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useStore.js';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { useProductionOverview } from '../../hooks/useProductionData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const ProductionOverview: React.FC = () => {
  const navigate = useNavigate();
  const { liveConnected, setCopilotOpen } = useAppStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useProductionOverview();

  const metrics = data?.metrics || {
    oee: 0,
    availability: 0,
    performance: 0,
    quality: 0,
    totalOutput: 0,
    downtimeHours: 0
  };

  const productionLines = data?.productionLines || [];
  const oeeTrendData = data?.oeeTrend || [];
  const downtimeCauseData = data?.downtimeByCause || [];
  const prodVsTargetData = data?.productionVsTarget || [];
  const bottleneck = data?.bottleneck;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">Production Operations & Line Efficiency Hub</h2>
          <p className="text-xs text-slate-400">All line outputs, OEE, downtime events and bottlenecks calculated dynamically by backend</p>
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
        isEmpty={!isLoading && !isError && productionLines.length === 0}
        emptyTitle="No Production Lines Configured"
        emptyMessage="No production lines currently exist in the database. Register machines from the Admin panel."
        onRetry={() => refetch()}
      >
        {/* Top 6 KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="industrial-card p-4 text-center cursor-pointer border-purple-900/60 hover:border-purple-500" onClick={() => navigate('/production/oee')}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Plant OEE</p>
            <p className="text-3xl font-black text-purple-400 font-mono">{metrics.oee !== null ? `${metrics.oee}%` : 'N/A'}</p>
            <span className="text-[10px] text-emerald-400 font-bold">Dynamic Metric</span>
          </div>

          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Availability</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.availability !== null ? `${metrics.availability}%` : 'N/A'}</p>
            <span className="text-[10px] text-emerald-400 font-bold">● Active</span>
          </div>

          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Performance</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.performance !== null ? `${metrics.performance}%` : 'N/A'}</p>
            <span className="text-[10px] text-emerald-400 font-bold">● Active</span>
          </div>

          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Quality</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.quality !== null ? `${metrics.quality}%` : 'N/A'}</p>
            <span className="text-[10px] text-emerald-400 font-bold">● Active</span>
          </div>

          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Output</p>
            <p className="text-3xl font-black text-white font-mono">{metrics.totalOutput ? metrics.totalOutput.toLocaleString() : '0'}</p>
            <span className="text-[10px] text-slate-400 font-semibold">units</span>
          </div>

          <div className="industrial-card p-4 text-center border-red-900/40">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Downtime</p>
            <p className="text-3xl font-black text-red-400 font-mono">{metrics.downtimeHours}h</p>
            <span className="text-[10px] text-slate-400 font-semibold">cumulative</span>
          </div>

        </div>

        {/* Main Row: Production Lines, OEE Trend, Downtime by Cause */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Production Line Status List */}
          <div className="industrial-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <Layers size={16} className="text-purple-400" /> Production Line Status
              </h3>
              <button onClick={() => navigate('/production/lines')} className="text-xs text-purple-400 hover:underline">
                All Lines →
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {productionLines.map((line: any) => (
                <div
                  key={line.id || line.code}
                  className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                    line.status === 'DOWN'
                      ? 'bg-red-950/60 border border-red-800'
                      : line.status === 'WARNING'
                      ? 'bg-amber-950/40 border border-amber-800/60'
                      : 'bg-slate-900 hover:border hover:border-slate-700'
                  }`}
                  onClick={() => navigate(`/production/lines/${line.code || line.id}`)}
                >
                  <span className="font-bold text-white">{line.code || line.name}</span>
                  <span className={`font-bold ${
                    line.status === 'DOWN' ? 'text-red-400' : line.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    ● {line.status}
                  </span>
                  <span className="text-slate-300 font-bold">{line.oee}% OEE</span>
                </div>
              ))}
            </div>
          </div>

          {/* OEE Trend Purple Line Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">OEE Trend (%)</h3>
            <div className="h-44 w-full">
              {oeeTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={oeeTrendData}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="oee" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3, fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No OEE history</div>
              )}
            </div>
          </div>

          {/* Downtime by Cause Pie Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Downtime by Cause</h3>
            <div className="h-44 w-full flex items-center justify-center">
              {downtimeCauseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={downtimeCauseData} dataKey="percentage" nameKey="cause" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                      {downtimeCauseData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No downtime causes</div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Grid: Production vs Target, Bottleneck Analysis, AI Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Production vs Target Bar Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Production vs Target</h3>
            <div className="h-48 w-full">
              {prodVsTargetData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prodVsTargetData}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Bar dataKey="actual" fill="#7c3aed" name="Actual Output" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No production orders</div>
              )}
            </div>
          </div>

          {/* Bottleneck Analysis Card */}
          <div className="industrial-card p-5 flex flex-col justify-between space-y-3 border-amber-900/60">
            <div>
              <h3 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <AlertCircle size={16} /> Dynamic Bottleneck Analysis
              </h3>
              
              {bottleneck ? (
                <div className="space-y-2 text-xs">
                  <p><span className="text-slate-400">Bottleneck:</span> <strong className="text-white font-mono">{bottleneck.lineCode}</strong> ({bottleneck.oee}% OEE)</p>
                  <p><span className="text-slate-400">Reason:</span> <strong className="text-slate-200">{bottleneck.reason}</strong></p>
                  <p><span className="text-slate-400">Impact:</span> <span className={`px-2 py-0.5 rounded font-bold border ${bottleneck.impact === 'HIGH' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-amber-950 text-amber-400 border-amber-800'}`}>{bottleneck.impact}</span></p>
                  <p className="text-slate-300 pt-1 leading-relaxed">
                    Recommendation: {bottleneck.recommendation}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">All lines currently running within nominal performance limits. No bottleneck detected.</p>
              )}
            </div>

            {bottleneck && (
              <button
                onClick={() => navigate(`/production/lines/${bottleneck.lineCode}`)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs font-semibold rounded text-center transition"
              >
                View Line Details →
              </button>
            )}
          </div>

          {/* AI Production Recommendations */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
              <Bot size={16} /> AI Production Recommendations
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg flex items-start gap-2 border border-slate-800">
                <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="text-slate-200">Rebalance scheduled batch quantities across operational weaving looms</p>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg flex items-start gap-2 border border-slate-800">
                <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="text-slate-200">Prioritize planned maintenance during scheduled shift changeover window</p>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg flex items-start gap-2 border border-slate-800">
                <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p className="text-slate-200">Pre-stage yarn supplies to eliminate line changeover delays</p>
              </div>

              <button
                onClick={() => setCopilotOpen(true)}
                className="w-full py-1.5 mt-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold rounded text-[11px] transition"
              >
                Ask Copilot for line scheduling recommendations →
              </button>
            </div>
          </div>

        </div>
      </QueryStateWrapper>
    </div>
  );
};
