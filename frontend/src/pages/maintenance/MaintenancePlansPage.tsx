import React from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { useMaintenancePlans } from '../../hooks/useMaintenanceData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

const priorityLabel: Record<string, string> = {
  CRITICAL: 'CRITIQUE',
  HIGH: 'ÉLEVÉ',
  MEDIUM: 'MOYEN',
  LOW: 'FAIBLE',
};

const statusLabel: Record<string, string> = {
  PLANNED: 'PLANIFIÉ',
  IN_PROGRESS: 'EN COURS',
  COMPLETED: 'TERMINÉ',
  CANCELLED: 'ANNULÉ',
  SCHEDULED: 'PROGRAMMÉ',
};

export const MaintenancePlansPage: React.FC = () => {
  const { data: plans = [], isLoading, isError, error, refetch } = useMaintenancePlans();

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays size={20} className="text-teal-400" /> Planning Maintenance Préventive & Prédictive
          </h1>
          <p className="text-xs text-slate-400">Interventions planifiées et calendrier d'arrêts chargés depuis le backend</p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Actualiser le planning"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && plans.length === 0}
        emptyTitle="Aucun plan de maintenance trouvé"
        emptyMessage="Aucun plan de maintenance planifié n'existe dans la base de données."
        onRetry={() => refetch()}
      >
        <div className="industrial-card p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3">ID Machine</th>
                  <th className="pb-3">Titre de l'Intervention</th>
                  <th className="pb-3">Date Planifiée</th>
                  <th className="pb-3">Durée</th>
                  <th className="pb-3">Technicien Assigné</th>
                  <th className="pb-3">Priorité</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plans.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 font-bold text-blue-400">{p.machine?.code || 'N/A'}</td>
                    <td className="py-3 font-sans text-white font-semibold">{p.title}</td>
                    <td className="py-3 text-slate-300">
                      {p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Programmé'}
                    </td>
                    <td className="py-3 text-slate-400">{p.durationHours || 2.0} h</td>
                    <td className="py-3 font-sans text-slate-300">{p.assignedTechnician || 'Karim Ben Ali'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                        p.priority === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800'
                        : p.priority === 'HIGH' ? 'bg-amber-950 text-amber-400'
                        : 'bg-slate-800 text-slate-300'
                      }`}>
                        {priorityLabel[p.priority] || p.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[10px] bg-teal-950 text-teal-400 rounded font-bold border border-teal-800">
                        {statusLabel[p.status] || p.status}
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
