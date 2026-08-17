import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Zap,
  Clock,
  ArrowRight,
  Download
} from 'lucide-react';
import { useProductionPerformance, useProductionOverview } from '../../hooks/useProductionData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ProductionPerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const perfQuery = useProductionPerformance();
  const overviewQuery = useProductionOverview();

  return (
    <QueryStateWrapper query={perfQuery}>
      {({ lines }) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                <span>PRODUCTION PLATFORM</span>
                <span>/</span>
                <span className="text-slate-100">PERFORMANCE & OUTPUT RATE</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <TrendingUp className="text-purple-400" />
                Line Production Performance & Speed Efficiency
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Real-time weaving speed, meters produced vs targets, and speed loss analysis</p>
            </div>

            <button
              onClick={() => window.open('http://localhost:4000/api/exports/bi-datasets/production_events/download', '_blank')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download size={14} /> Export Production Events CSV
            </button>
          </div>

          {/* Lines Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lines.map((line: any) => (
              <div
                key={line.lineCode}
                onClick={() => navigate(`/production/lines/${line.lineCode}`)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-purple-500/50 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded">
                      {line.lineCode}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Efficiency: {line.efficiencyRatio}%
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white">{line.lineName}</h3>
                </div>

                <div className="my-4 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Produced / Target:</span>
                    <span className="text-white font-bold">{line.currentOutput}m / {line.targetOutput}m</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min(line.efficiencyRatio, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Performance Rate: <strong className="text-white">{line.performancePct}%</strong></span>
                  <span className="text-purple-400 font-bold flex items-center gap-1">Inspect <ArrowRight size={13} /></span>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Comparison Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-1">Production Output vs Target by Production Line</h3>
            <p className="text-xs text-slate-400 mb-4">Meters woven per operational line</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lines}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="lineCode" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 15000]} unit="m" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <Bar dataKey="currentOutput" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Actual Output (m)" />
                  <Bar dataKey="targetOutput" fill="#334155" radius={[4, 4, 0, 0]} name="Target Output (m)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
