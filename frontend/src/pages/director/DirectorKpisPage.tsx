import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  DollarSign,
  ArrowRight,
  Download
} from 'lucide-react';
import { useDirectorKPIs, useDirectorFinancialImpact } from '../../hooks/useDirectorData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const DirectorKpisPage: React.FC = () => {
  const navigate = useNavigate();
  const kpiQuery = useDirectorKPIs();
  const finQuery = useDirectorFinancialImpact();

  return (
    <QueryStateWrapper query={kpiQuery}>
      {(kpis) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                <span>DIRECTOR SUITE</span>
                <span>/</span>
                <span className="text-slate-100">EXECUTIVE PLANT KPIS</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <BarChart3 className="text-amber-400" />
                Strategic Operational & Financial KPIs
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">High-level executive metrics for factory throughput, asset health, and cost avoidance</p>
            </div>

            <button
              onClick={() => window.open('http://localhost:4000/api/exports/bi-datasets/financial_impact/download', '_blank')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download size={14} /> Export Financial Impact CSV
            </button>
          </div>

          {/* Strategic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase">Overall Plant Health</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{kpis.plantHealthScore}%</div>
              <p className="text-xs text-slate-400 mt-1">Composite prognostic score</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase">Plant-Wide OEE</span>
              <div className="text-3xl font-black text-amber-400 font-mono mt-1">{kpis.avgOee}%</div>
              <p className="text-xs text-slate-400 mt-1">Weighted availability & speed</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase">Avoided Downtime Savings</span>
              <div className="text-3xl font-black text-cyan-400 font-mono mt-1">€{kpis.costAvoidanceYtdEur.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">Predictive intervention value</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase">AI Model Accuracy</span>
              <div className="text-3xl font-black text-purple-400 font-mono mt-1">{kpis.modelAccuracy}%</div>
              <p className="text-xs text-slate-400 mt-1 font-mono">Champion: {kpis.modelVersion}</p>
            </div>
          </div>

          {/* Detailed Strategic Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Executive Summary — Tunisian Textile Demo Factory</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              MAINTIX Prognostics engine has continuously guarded 6 weaving loom assets across 5 production lines.
              Stage 3 bearing degradation on primary rapier loom <strong className="text-white">PCL-GMX-001</strong> was proactively identified with an 18-day RUL window, successfully preventing an estimated €24,650 in catastrophic gearbox damage and loom stoppage.
            </p>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={16} /> ISO 10816-3 & ISO 13374 Compliant
              </span>
              <button
                onClick={() => navigate('/director/analytics')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition"
              >
                Deep Financial ROI Analysis <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
