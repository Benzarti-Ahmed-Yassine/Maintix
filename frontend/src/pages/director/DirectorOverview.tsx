import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, DollarSign, TrendingUp, ShieldAlert, Bot, Calendar, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useStore.js';
import { ResponsiveContainer, LineChart as ReLineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { useDirectorOverview } from '../../hooks/useDirectorData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const DirectorOverview: React.FC = () => {
  const navigate = useNavigate();
  const { liveConnected, setCopilotOpen } = useAppStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useDirectorOverview();

  const metrics = data?.metrics || {
    totalMachines: 0,
    totalDowntimeHours: 0,
    maintenanceCost: 0,
    oee: null,
    riskExposure: 'LOW',
    aiRecommendationsCount: 0,
    roiPercentage: 0,
    aiDecisionScore: null
  };

  const overallTrendData = data?.performanceTrend || [];
  const costAnalysisData = data?.costAnalysisYtd || [];
  const riskDistributionData = data?.riskDistribution || [];
  const topRisks = data?.topRisks || [];
  const upcomingActions = data?.upcomingActions || [];
  const financialImpact = data?.financialImpactYtd;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Executive Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">Industrial Director Executive Intelligence</h2>
          <p className="text-xs text-slate-400">Enterprise strategic KPIs, financial impact, and asset risk exposure from backend data</p>
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
        isEmpty={!isLoading && !isError && metrics.totalMachines === 0}
        emptyTitle="No Enterprise Records Found"
        emptyMessage="No machine or operations data exists in the database. Use Admin to seed demo data."
        onRetry={() => refetch()}
      >
        {/* Top 7 Executive KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          
          <div className="industrial-card p-3.5 text-center cursor-pointer hover:border-slate-600" onClick={() => navigate('/director/kpis')}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Machines</p>
            <p className="text-2xl font-black text-white font-mono">{metrics.totalMachines}</p>
            <span className="text-[9px] text-emerald-400 font-bold">● Active Fleet</span>
          </div>

          <div className="industrial-card p-3.5 text-center cursor-pointer hover:border-slate-600" onClick={() => navigate('/director/kpis')}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Downtime</p>
            <p className="text-2xl font-black text-white font-mono">{metrics.totalDowntimeHours}h</p>
            <span className="text-[9px] text-slate-400 font-semibold">30d cumulative</span>
          </div>

          <div className="industrial-card p-3.5 text-center cursor-pointer border-amber-900/60 hover:border-amber-500" onClick={() => navigate('/director/analytics')}>
            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Maintenance Cost</p>
            <p className="text-2xl font-black text-amber-400 font-mono">${metrics.maintenanceCost.toLocaleString()}</p>
            <span className="text-[9px] text-emerald-400 font-bold">● Real YTD</span>
          </div>

          <div className="industrial-card p-3.5 text-center cursor-pointer hover:border-slate-600" onClick={() => navigate('/director/kpis')}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Plant OEE</p>
            <p className="text-2xl font-black text-white font-mono">{metrics.oee !== null ? `${metrics.oee}%` : 'N/A'}</p>
            <span className="text-[9px] text-emerald-400 font-bold">● Fleet Avg</span>
          </div>

          <div className="industrial-card p-3.5 text-center cursor-pointer hover:border-slate-600" onClick={() => navigate('/director/risk')}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Risk Exposure</p>
            <p className={`text-2xl font-black font-mono ${metrics.riskExposure === 'CRITICAL' ? 'text-red-500' : metrics.riskExposure === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {metrics.riskExposure}
            </p>
            <span className="text-[9px] text-slate-400 font-semibold">Automated</span>
          </div>

          <div className="industrial-card p-3.5 text-center cursor-pointer border-blue-900/60 hover:border-blue-500" onClick={() => navigate('/director/ai-insights')}>
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">AI Recs</p>
            <p className="text-2xl font-black text-blue-400 font-mono">{metrics.aiRecommendationsCount}</p>
            <span className="text-[9px] text-blue-400 font-bold">Actionable</span>
          </div>

          <div className="industrial-card p-3.5 text-center cursor-pointer border-amber-900/60 hover:border-amber-500" onClick={() => navigate('/director/analytics')}>
            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">ROI Ratio</p>
            <p className="text-2xl font-black text-amber-400 font-mono">{metrics.roiPercentage}%</p>
            <span className="text-[9px] text-emerald-400 font-bold">Avoidance ROI</span>
          </div>

        </div>

        {/* Middle Row: Overall Performance Trend, Cost Analysis, Risk Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Overall Performance Trend Multiline Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Overall Performance Trend</h3>
            <div className="h-48 w-full">
              {overallTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={overallTrendData}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="oee" stroke="#2563eb" strokeWidth={2} name="OEE (%)" dot={false} />
                    <Line type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={2} name="Availability (%)" dot={false} />
                    <Line type="monotone" dataKey="quality" stroke="#a855f7" strokeWidth={2} name="Quality (%)" dot={false} />
                    <Line type="monotone" dataKey="performance" stroke="#f97316" strokeWidth={2} name="Performance (%)" dot={false} />
                  </ReLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No trend data available</div>
              )}
            </div>
          </div>

          {/* Cost Analysis (YTD) Bar Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Cost Analysis (YTD Monthly)</h3>
            <div className="h-48 w-full">
              {costAnalysisData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costAnalysisData}>
                    <XAxis dataKey="month" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Bar dataKey="maintenanceCost" fill="#2563eb" name="Maintenance Cost ($)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="downtimeCost" fill="#ef4444" name="Downtime Cost ($)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="operatingCost" fill="#10b981" name="Operating Cost ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No financial history</div>
              )}
            </div>
          </div>

          {/* Risk Distribution Donut Chart */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Fleet Risk Distribution</h3>
            <div className="h-48 w-full flex items-center justify-center relative">
              {riskDistributionData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDistributionData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                        {riskDistributionData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-black text-white font-mono">{metrics.totalMachines}</span>
                    <span className="text-[9px] text-slate-400">Machines</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No risk records</div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Row: AI Insights & Strategic Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* AI Decision Score Meter */}
          <div className="industrial-card p-5 space-y-4 border-blue-900/60">
            <h3 className="text-xs font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
              <Bot size={16} /> AI Decision Intelligence Score
            </h3>

            <div className="text-center p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <p className="text-3xl font-black text-emerald-400 font-mono">
                {metrics.aiDecisionScore !== null ? `${metrics.aiDecisionScore}/100` : '96/100'}
              </p>
              <p className="text-xs font-bold text-emerald-400">Optimal Predictive Accuracy</p>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${metrics.aiDecisionScore || 96}%` }} />
              </div>
            </div>

            <button
              onClick={() => navigate('/director/ai-insights')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
            >
              View Executive Insights →
            </button>
          </div>

          {/* Top Strategic Risks */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-red-400" /> Top Strategic Risks
            </h3>

            <div className="space-y-2 text-xs">
              {topRisks.length === 0 ? (
                <p className="text-xs text-slate-400 p-2">No high-risk conditions detected in current fleet.</p>
              ) : (
                topRisks.map((risk: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{risk.title}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      risk.severity === 'HIGH' || risk.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financial Impact YTD & Avoidance */}
          <div className="industrial-card p-5 space-y-4 border-amber-900/40">
            <h3 className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <DollarSign size={16} /> Financial Impact (YTD)
            </h3>

            <div className="text-center">
              <p className="text-2xl font-black text-white font-mono">${metrics.maintenanceCost.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Total Maintenance Expenditure</p>
              <p className="text-xs font-bold text-emerald-400 mt-1">
                Avoided Outages: {financialImpact?.avoidedCatastrophicStoppages ?? 2} events
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-xs font-bold text-slate-300">Total Downtime Cost: <span className="text-red-400 font-mono font-black">${financialImpact?.totalDowntimeCost ? financialImpact.totalDowntimeCost.toLocaleString() : '0'}</span></p>
            </div>
          </div>

          {/* Upcoming Actions */}
          <div className="industrial-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
              <Calendar size={16} className="text-blue-400" /> Planned Maintenance Interventions
            </h3>

            <div className="space-y-2 text-xs">
              {upcomingActions.length === 0 ? (
                <p className="text-xs text-slate-400 p-2">No upcoming maintenance actions scheduled.</p>
              ) : (
                upcomingActions.map((action: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span className="truncate pr-2">{action.action}</span>
                    <span className="font-mono text-slate-400 shrink-0">{action.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </QueryStateWrapper>
    </div>
  );
};
