import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useMaintenanceRisk } from '../../hooks/useMaintenanceData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

const statusLabel: Record<string, string> = {
  CRITICAL: 'CRITIQUE',
  HIGH: 'ÉLEVÉ',
  WARNING: 'AVERTISSEMENT',
  NORMAL: 'NORMAL',
  OPERATIONAL: 'OPÉRATIONNEL',
};

export const RiskAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: risks = [], isLoading, isError, error, refetch } = useMaintenanceRisk();

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" /> Classement Risques Machines & Analytique Prédictive
          </h1>
          <p className="text-xs text-slate-400">Matrice de probabilité de défaillance priorisée et estimation dynamique de la durée de vie restante</p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Actualiser le classement"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && risks.length === 0}
        emptyTitle="Aucun enregistrement de risque trouvé"
        emptyMessage="Aucune machine n'est actuellement enregistrée dans le système d'analyse des risques. Utilisez l'Admin pour alimenter les données."
        onRetry={() => refetch()}
      >
        <div className="industrial-card p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3">Rang</th>
                  <th className="pb-3">ID Machine</th>
                  <th className="pb-3">Nom Machine</th>
                  <th className="pb-3">Score Risque</th>
                  <th className="pb-3">Score Santé</th>
                  <th className="pb-3">DRE Prédite</th>
                  <th className="pb-3">Alerte Principale</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {risks.map((r: any) => (
                  <tr
                    key={r.machineId}
                    className="hover:bg-slate-900/60 cursor-pointer transition"
                    onClick={() => navigate(`/technician/machines/${r.machineId}`)}
                  >
                    <td className="py-3 font-bold text-slate-400">#{r.rank}</td>
                    <td className="py-3 font-bold text-blue-400">{r.machineId}</td>
                    <td className="py-3 font-sans text-white">{r.machineName}</td>
                    <td className={`py-3 font-bold ${r.riskScore >= 70 ? 'text-red-400' : r.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {r.riskScore}%
                    </td>
                    <td className="py-3 text-slate-300">{r.healthScore}%</td>
                    <td className="py-3 text-amber-400">{r.rulDays} jours</td>
                    <td className="py-3 font-sans text-slate-300">{r.topAlert || 'Fonctionnement normal'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                        r.status === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : r.status === 'HIGH' || r.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-emerald-950 text-emerald-400'
                      }`}>
                        {statusLabel[r.status] || r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </QueryStateWrapper>
    </div>
  );
};
