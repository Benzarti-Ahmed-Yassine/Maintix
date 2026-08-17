import React from 'react';
import { Layers, Download } from 'lucide-react';
import { useProductionOrders } from '../../hooks/useProductionData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

const orderStatusLabel: Record<string, string> = {
  IN_PRODUCTION: 'EN COURS',
  COMPLETED: 'TERMINÉ',
  PLANNED: 'PLANIFIÉ',
  ON_HOLD: 'EN ATTENTE',
  CANCELLED: 'ANNULÉ',
};

export const ProductionOrdersPage: React.FC = () => {
  const ordersQuery = useProductionOrders();

  return (
    <QueryStateWrapper query={ordersQuery}>
      {(orders: any) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                <span>PLATEFORME PRODUCTION</span>
                <span>/</span>
                <span className="text-slate-100">ORDRES MES & DISPATCH</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Layers className="text-purple-400" />
                Ordres de Fabrication MES & Planning Encours
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Synchronisation en temps réel avec l'exécution MES Siemens Opcenter</p>
            </div>

            <button
              onClick={() => window.open('http://localhost:4000/api/exports/bi-datasets/production_events/download', '_blank')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download size={14} /> Exporter Ordres CSV
            </button>
          </div>

          {/* Tableau des ordres */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4">Registre des Ordres de Fabrication</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">N° d'Ordre</th>
                    <th className="p-3">Ligne</th>
                    <th className="p-3">Référence Produit</th>
                    <th className="p-3">Avancement (Réel / Cible)</th>
                    <th className="p-3">Complétion %</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Date Début</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {orders.map((o: any) => {
                    const pct = Math.min(100, Math.round((o.producedQty / (o.targetQty || 1)) * 100));
                    return (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{o.orderNumber}</td>
                        <td className="p-3 text-purple-400">{o.line?.lineCode} ({o.line?.name})</td>
                        <td className="p-3 text-slate-200 font-sans">{o.productCode}</td>
                        <td className="p-3 font-bold text-white">{o.producedQty.toLocaleString('fr-FR')}m / {o.targetQty.toLocaleString('fr-FR')}m</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-300">{pct}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'IN_PRODUCTION'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : o.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {orderStatusLabel[o.status] || o.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">
                          {new Date(o.startDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
