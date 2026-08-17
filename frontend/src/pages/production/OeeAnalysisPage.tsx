import React from 'react';
import { Gauge, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useProductionLines } from '../../hooks/useProductionData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const OeeAnalysisPage: React.FC = () => {
  const { data: lines = [], isLoading, isError, error, refetch } = useProductionLines();

  const oeeComponents = lines.map((l: any) => ({
    name: l.lineCode || l.name,
    availability: l.availability || 0,
    performance: l.performance || 0,
    quality: l.quality || 0,
    oee: l.oee || 0
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gauge size={20} className="text-purple-400" /> Comprehensive OEE / TRS Breakdown
          </h1>
          <p className="text-xs text-slate-400">Overall Equipment Effectiveness metrics across all production lines</p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Refresh OEE Breakdown"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && oeeComponents.length === 0}
        emptyTitle="No Production Lines Found"
        emptyMessage="No production lines are available to calculate OEE."
        onRetry={() => refetch()}
      >
        <div className="industrial-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">OEE Factors Comparison (Availability × Performance × Quality)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={oeeComponents}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Bar dataKey="availability" fill="#3b82f6" name="Availability (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="performance" fill="#f59e0b" name="Performance (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quality" fill="#10b981" name="Quality (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="oee" fill="#a855f7" name="Total OEE (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </QueryStateWrapper>
    </div>
  );
};
