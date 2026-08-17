import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTechnicianMachines, useAcknowledgeAlert } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

interface AlarmItem {
  id: string;
  code: string;
  machine: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  desc: string;
  time: string;
  status: string;
}

const severityLabel: Record<string, string> = {
  CRITICAL: 'CRITIQUE',
  HIGH: 'ÉLEVÉ',
  MEDIUM: 'MOYEN',
  LOW: 'FAIBLE',
};

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: machines, isLoading, isError, error, refetch } = useTechnicianMachines();
  const acknowledgeMutation = useAcknowledgeAlert();

  const alerts: AlarmItem[] = [];
  if (Array.isArray(machines)) {
    machines.forEach((m: any) => {
      if (m.latestAlert) {
        alerts.push({
          id: m.latestAlert.id || `alm-${m.code}`,
          code: `ALM-${m.code}`,
          machine: m.code,
          severity: m.latestAlert.severity || (m.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH'),
          title: m.latestAlert.title || 'Déclenchement seuil capteur',
          desc: `Alarme de diagnostic actif enregistrée sur la machine ${m.name}`,
          time: m.latestAlert.timestamp ? new Date(m.latestAlert.timestamp).toLocaleTimeString('fr-FR') : 'Récent',
          status: 'ACTIF'
        });
      }
    });
  }

  const handleAcknowledge = async (e: React.MouseEvent, machineCode: string, alertId: string) => {
    e.stopPropagation();
    acknowledgeMutation.mutate({ alertId });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" /> Alarmes Système Actives & Diagnostics Machine
          </h1>
          <p className="text-xs text-slate-400">Toutes les alertes diffusées depuis la télémétrie en direct et le moteur IA backend</p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Actualiser les alertes"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && alerts.length === 0}
        emptyTitle="Aucune alarme machine active"
        emptyMessage="Toutes les machines des lignes de production fonctionnent dans les paramètres normaux."
        onRetry={() => refetch()}
      >
        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/technician/machines/${a.machine}`)}
              className="industrial-card p-4 flex items-center justify-between hover:border-red-500/60 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg border ${
                  a.severity === 'CRITICAL' ? 'bg-red-950/80 border-red-800 text-red-400' : 'bg-amber-950/80 border-amber-800 text-amber-400'
                }`}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{a.code}</span>
                    <span className="font-mono text-xs font-bold text-blue-400">[{a.machine}]</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                      a.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {severityLabel[a.severity] || a.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-0.5">{a.title}</h3>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400 flex items-center gap-3">
                <span>{a.time}</span>
                <button
                  onClick={(e) => handleAcknowledge(e, a.machine, a.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold rounded border border-slate-700 flex items-center gap-1 transition"
                  title="Acquitter l'alarme"
                >
                  <CheckCircle2 size={12} /> Acquitter
                </button>
                <ChevronRight size={18} className="text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </QueryStateWrapper>
    </div>
  );
};
