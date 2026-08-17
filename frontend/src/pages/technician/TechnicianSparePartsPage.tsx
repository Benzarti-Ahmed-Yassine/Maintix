import React from 'react';
import { Package } from 'lucide-react';
import { useTechnicianSpareParts } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const TechnicianSparePartsPage: React.FC = () => {
  const partsQuery = useTechnicianSpareParts();

  return (
    <QueryStateWrapper query={partsQuery}>
      {(parts: any) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
                <span>ESPACE TECHNICIEN</span>
                <span>/</span>
                <span className="text-slate-100">INVENTAIRE ENTREPÔT SAP ERP</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Package className="text-blue-400" />
                Stock Pièces de Rechange & Index Localisation Entrepôt
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Niveaux de stock en temps réel, emplacements de rayonnage et références pièces pour métiers à tisser</p>
            </div>
          </div>

          {/* Tableau des pièces */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4">Inventaire des Pièces de Rechange</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Référence</th>
                    <th className="p-3">Désignation</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Stock Disponible</th>
                    <th className="p-3">Emplacement</th>
                    <th className="p-3">Fournisseur</th>
                    <th className="p-3 text-right">Prix Unitaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parts.map((p: any) => {
                    const isLow = p.quantityInStock <= p.minThreshold;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{p.partNumber}</td>
                        <td className="p-3 text-slate-200 font-sans">{p.name}</td>
                        <td className="p-3 text-blue-400">{p.category}</td>
                        <td className="p-3">
                          <span className={`font-bold ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                            {p.quantityInStock} unités {isLow && '(STOCK FAIBLE)'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{p.location || 'Rayon A-12'}</td>
                        <td className="p-3 text-slate-400">{p.supplier || 'SKF Industrial'}</td>
                        <td className="p-3 text-right font-bold text-white">{p.unitCost} €</td>
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
