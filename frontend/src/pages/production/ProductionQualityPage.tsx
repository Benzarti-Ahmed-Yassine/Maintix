import React from 'react';
import { ShieldCheck, Download } from 'lucide-react';
import { useProductionQuality } from '../../hooks/useProductionData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const ProductionQualityPage: React.FC = () => {
  const qualityQuery = useProductionQuality();

  return (
    <QueryStateWrapper query={qualityQuery}>
      {(events: any) => {
        const totalInspected = events.reduce((sum: number, q: any) => sum + q.totalInspected, 0) || 1;
        const totalDefects = events.reduce((sum: number, q: any) => sum + q.defectCount, 0);
        const totalScrapCost = events.reduce((sum: number, q: any) => sum + (q.scrapCost || 0), 0);
        const defectRate = ((totalDefects / totalInspected) * 100).toFixed(2);

        return (
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                  <span>PLATEFORME PRODUCTION</span>
                  <span>/</span>
                  <span className="text-slate-100">QUALITÉ & CONTRÔLE REBUTS</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                  <ShieldCheck className="text-purple-400" />
                  Qualité Tissu & Suivi des Défauts de Tissage
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Taux de défauts chaîne/trame en temps réel, volumes d'inspection et analyse des coûts de rebut</p>
              </div>

              <button
                onClick={() => window.open('http://localhost:4000/api/exports/bi-datasets/quality_events/download', '_blank')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
              >
                <Download size={14} /> Exporter Qualité CSV
              </button>
            </div>

            {/* KPIs Qualité */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Tissu Inspecté</span>
                <div className="text-3xl font-black text-white font-mono mt-1">{totalInspected.toLocaleString('fr-FR')} m</div>
                <div className="text-xs text-slate-400 mt-1">Total mètres surveillés</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Rendement Premier Passage</span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{(100 - parseFloat(defectRate)).toFixed(2)}%</div>
                <div className="text-xs text-slate-400 mt-1">Standard de spécification nominal</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-amber-400 uppercase">Total Défauts Enregistrés</span>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1">{totalDefects}</div>
                <div className="text-xs text-slate-400 mt-1">Taux de défaut : {defectRate}%</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-red-400 uppercase">Pertes Rebuts / Retouches</span>
                <div className="text-3xl font-black text-red-400 font-mono mt-1">{totalScrapCost.toLocaleString('fr-FR')} €</div>
                <div className="text-xs text-slate-400 mt-1">Valeur rebuts tissu YTD</div>
              </div>
            </div>

            {/* Tableau qualité */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-4">Journal d'Inspection Qualité Tissu</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Horodatage</th>
                      <th className="p-3">Ligne</th>
                      <th className="p-3">Machine</th>
                      <th className="p-3">Volume Inspecté</th>
                      <th className="p-3">Nb Défauts</th>
                      <th className="p-3">Type Défaut</th>
                      <th className="p-3 text-right">Coût Rebut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {events.map((q: any) => (
                      <tr key={q.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-400">
                          {new Date(q.timestamp).toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 font-bold text-white">{q.line?.lineCode || 'Ligne 4'}</td>
                        <td className="p-3 text-blue-400">{q.machine?.code || 'PCL-GMX-001'}</td>
                        <td className="p-3 text-slate-200">{q.totalInspected} m</td>
                        <td className="p-3 font-bold text-amber-400">{q.defectCount}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700 font-sans">
                            {q.defectType}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-red-400">{q.scrapCost || 0} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }}
    </QueryStateWrapper>
  );
};
