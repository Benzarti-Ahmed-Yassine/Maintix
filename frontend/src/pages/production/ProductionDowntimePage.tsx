import React from 'react';
import { Clock, Download } from 'lucide-react';
import { useProductionDowntime } from '../../hooks/useProductionData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const ProductionDowntimePage: React.FC = () => {
  const downtimeQuery = useProductionDowntime();

  return (
    <QueryStateWrapper query={downtimeQuery}>
      {(events: any) => {
        const totalDowntimeMinutes = events.reduce((sum: number, e: any) => sum + e.durationMinutes, 0);
        const totalFinancialImpact = events.reduce((sum: number, e: any) => sum + (e.financialImpact || 0), 0);

        return (
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                  <span>PLATEFORME PRODUCTION</span>
                  <span>/</span>
                  <span className="text-slate-100">ARRÊTS & PERTES</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                  <Clock className="text-purple-400" />
                  Journal des Incidents d'Arrêt & Analyse des Pertes
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Enregistrement chronologique des arrêts planifiés et non planifiés avec cartographie de l'impact financier</p>
              </div>

              <button
                onClick={() => window.open('http://localhost:4000/api/exports/bi-datasets/downtime_events/download', '_blank')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
              >
                <Download size={14} /> Exporter Arrêts CSV
              </button>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Incidents Enregistrés</span>
                <div className="text-3xl font-black text-white font-mono mt-1">{events.length}</div>
                <div className="text-xs text-slate-400 mt-1">30 derniers jours opérationnels</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-amber-400 uppercase">Temps d'Arrêt Cumulé</span>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                  {(totalDowntimeMinutes / 60).toFixed(1)} <span className="text-base text-slate-400 font-normal">heures</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{totalDowntimeMinutes} minutes au total</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-red-400 uppercase">Coût Total des Arrêts</span>
                <div className="text-3xl font-black text-red-400 font-mono mt-1">
                  {totalFinancialImpact.toLocaleString('fr-FR')} €
                </div>
                <div className="text-xs text-slate-400 mt-1">Basé sur 1 680 €/h de capacité perdue</div>
              </div>
            </div>

            {/* Tableau des incidents */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-4">Journal des Événements d'Arrêt</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Horodatage</th>
                      <th className="p-3">Ligne</th>
                      <th className="p-3">Machine</th>
                      <th className="p-3">Durée</th>
                      <th className="p-3">Catégorie Cause</th>
                      <th className="p-3">Description Cause Racine</th>
                      <th className="p-3 text-right">Impact Financier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {events.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-400">
                          {new Date(e.startTime).toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 font-bold text-white">{e.line?.lineCode || 'Ligne 4'}</td>
                        <td className="p-3 text-blue-400">{e.machine?.code || 'PCL-GMX-001'}</td>
                        <td className="p-3 font-bold text-amber-400">{e.durationMinutes} min</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                            {e.causeCategory}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 font-sans">{e.rootCause || 'Dépassement seuil vibration roulement'}</td>
                        <td className="p-3 text-right font-bold text-red-400">{e.financialImpact || 0} €</td>
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
