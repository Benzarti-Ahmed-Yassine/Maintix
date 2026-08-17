import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building
} from 'lucide-react';
import { useDirectorOperations } from '../../hooks/useDirectorData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const DirectorOperationsPage: React.FC = () => {
  const navigate = useNavigate();
  const opsQuery = useDirectorOperations();

  return (
    <QueryStateWrapper query={opsQuery}>
      {(ops) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                <span>DIRECTOR SUITE</span>
                <span>/</span>
                <span className="text-slate-100">FACTORY OPERATIONS OVERVIEW</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Factory className="text-amber-400" />
                Plant Floor Asset & Production Line Operations
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">{ops.factory} • Multi-Line Overview</p>
            </div>
          </div>

          {/* Plant Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase">Operational Lines</span>
              <div className="text-3xl font-black text-white font-mono mt-1">{ops.activeProductionLines} / {ops.totalLines}</div>
              <p className="text-xs text-emerald-400 mt-1">4 Lines Operating Normally</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase">Monitored Assets</span>
              <div className="text-3xl font-black text-white font-mono mt-1">{ops.totalActiveMachines} / {ops.totalMachines}</div>
              <p className="text-xs text-amber-400 mt-1">1 Asset in Stage 3 Degradation</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase">Plant Location</span>
              <div className="text-xl font-bold text-white font-mono mt-1">Monastir, Tunisia</div>
              <p className="text-xs text-slate-400 mt-1">Weaving & Finishing Division</p>
            </div>
          </div>

          {/* Lines Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ops.linesSummary.map((line: any) => (
              <div
                key={line.lineCode}
                onClick={() => navigate(`/production/lines/${line.lineCode}`)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-amber-500/50 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                      {line.lineCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        line.status === 'DOWN' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {line.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{line.name}</h3>
                </div>

                <div className="my-4 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Line OEE:</span>
                    <strong className="text-white">{line.oee}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Output:</span>
                    <strong className="text-white">{line.output} meters</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
