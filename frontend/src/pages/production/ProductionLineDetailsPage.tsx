import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useProductionLine } from '../../hooks/useProductionData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const ProductionLineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const lineCode = id || 'Line 4';
  const navigate = useNavigate();

  const { data: lineData, isLoading, isError, error, refetch } = useProductionLine(lineCode);
  const machines = lineData?.machines || [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Production Line Analysis: <span className="font-mono text-purple-400">{lineData?.lineCode || lineCode}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {lineData?.name || 'Production Line Diagnostics'} • Target Output: {(lineData?.targetOutput || 0).toLocaleString()} units
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Refresh Line Details"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && !lineData}
        emptyTitle="Production Line Not Found"
        emptyMessage={`No line with code '${lineCode}' was found in the database.`}
        onRetry={() => refetch()}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`industrial-card p-4 text-center ${lineData?.status === 'DOWN' ? 'border-red-900/60' : lineData?.status === 'WARNING' ? 'border-amber-900/60' : 'border-slate-800'}`}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Current OEE</p>
            <p className={`text-3xl font-black font-mono ${lineData?.status === 'DOWN' ? 'text-red-400' : lineData?.status === 'WARNING' ? 'text-amber-400' : 'text-purple-400'}`}>
              {lineData?.oee}%
            </p>
            <span className={`text-[10px] font-bold ${lineData?.status === 'DOWN' ? 'text-red-400' : lineData?.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
              ● {lineData?.status}
            </span>
          </div>
          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Availability</p>
            <p className="text-3xl font-black text-white font-mono">{lineData?.availability}%</p>
          </div>
          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Performance</p>
            <p className="text-3xl font-black text-white font-mono">{lineData?.performance}%</p>
          </div>
          <div className="industrial-card p-4 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Quality</p>
            <p className="text-3xl font-black text-white font-mono">{lineData?.quality}%</p>
          </div>
        </div>

        <div className="industrial-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">{lineData?.lineCode} Machine Health Matrix</h3>
          
          {machines.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">No machines assigned to this line.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2">Machine ID</th>
                    <th className="pb-2">Machine Name</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Health Score</th>
                    <th className="pb-2">Risk Probability</th>
                    <th className="pb-2">Predicted RUL</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {machines.map((m: any) => (
                    <tr
                      key={m.code}
                      className="hover:bg-slate-900/60 cursor-pointer transition"
                      onClick={() => navigate(`/technician/machines/${m.code}`)}
                    >
                      <td className="py-3 font-bold text-blue-400">{m.code}</td>
                      <td className="py-3 font-sans text-white font-semibold">{m.name}</td>
                      <td className="py-3 font-sans text-slate-300">{m.type}</td>
                      <td className="py-3 font-bold text-slate-200">{m.healthScore}%</td>
                      <td className={`py-3 font-bold ${m.failureProbability >= 0.7 ? 'text-red-400' : m.failureProbability >= 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {Math.round((m.failureProbability || 0) * 100)}%
                      </td>
                      <td className="py-3 text-amber-400">{m.predictedRulDays} days</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                          m.status === 'CRITICAL' || m.status === 'DOWN'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : m.status === 'WARNING' || m.status === 'HIGH'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </QueryStateWrapper>
    </div>
  );
};
