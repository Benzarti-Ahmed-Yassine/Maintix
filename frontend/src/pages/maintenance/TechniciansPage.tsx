import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Wrench,
  UserCheck,
  ArrowRight,
  Mail
} from 'lucide-react';
import { useTechniciansTeam, useWorkOrders } from '../../hooks/useMaintenanceData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const TechniciansPage: React.FC = () => {
  const navigate = useNavigate();
  const techniciansQuery = useTechniciansTeam();
  useWorkOrders(); // chargé mais non utilisé directement

  return (
    <QueryStateWrapper query={techniciansQuery}>
      {(technicians: any) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
                <span>PLATEFORME MAINTENANCE</span>
                <span>/</span>
                <span className="text-slate-100">ÉQUIPE & TECHNICIENS</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Users className="text-teal-400" />
                Effectif Techniciens Maintenance & Matrice de Dispatch
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Charge de travail en temps réel, affectations des ordres actifs et métriques de complétion</p>
            </div>

            <button
              onClick={() => navigate('/maintenance/work-orders')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition"
            >
              <Wrench size={15} /> Dispatcher un Ordre de Travail
            </button>
          </div>

          {/* Grille des techniciens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {technicians.map((tech: any) => (
              <div
                key={tech.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-teal-500/40 transition"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={tech.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${tech.name}`}
                      alt={tech.name}
                      className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800"
                    />
                    <div>
                      <h3 className="font-bold text-base text-white">{tech.name}</h3>
                      <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} /> {tech.email}
                      </p>
                      <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-800/40 px-2 py-0.5 rounded mt-1 inline-block">
                        {tech.department || 'Maintenance Mécanique & Électrique'}
                      </span>
                    </div>
                  </div>

                  {/* Stats de charge de travail */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-950/60 rounded-lg text-center">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase">Ordres Actifs</span>
                      <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{tech.activeTasksCount}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">Terminés</span>
                      <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{tech.completedTasksCount}</div>
                    </div>
                  </div>

                  {/* Tâches actives récentes */}
                  <div className="space-y-1.5 mt-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Affectations récentes :</span>
                    {tech.currentAssignments && tech.currentAssignments.length > 0 ? (
                      tech.currentAssignments.slice(0, 2).map((wo: any) => (
                        <div
                          key={wo.id}
                          className="p-2 bg-slate-800/40 border border-slate-800 rounded text-xs flex items-center justify-between"
                        >
                          <span className="font-bold text-slate-200 truncate max-w-[180px]">{wo.title}</span>
                          <span className="text-[10px] font-mono text-blue-400">{wo.machine?.code}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aucune tâche en attente. Disponible pour affectation.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <UserCheck size={14} /> Certifié L1/L2
                  </span>
                  <button
                    onClick={() => navigate('/maintenance/work-orders')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                  >
                    Gérer les ordres <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
