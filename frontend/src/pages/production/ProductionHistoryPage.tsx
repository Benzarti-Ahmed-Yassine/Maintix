import React, { useState } from 'react';
import {
  History,
  Download,
  Search,
  Factory,
  BarChart3,
  Clock,
  Trash2,
  Layers,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';
import { useHistoryStore } from '../../store/useHistoryStore.js';
import { ActionCategory } from '../../types/index.js';

export const ProductionHistoryPage: React.FC = () => {
  const { getActionsByRole, exportHistoryAsCsv, clearHistory } = useHistoryStore();
  const actions = getActionsByRole('PRODUCTION_MANAGER');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredActions = actions.filter((a) => {
    const matchesSearch =
      a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.machineCode && a.machineCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'SUCCESS':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'INFO':
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getCategoryIcon = (category: ActionCategory) => {
    switch (category) {
      case 'PRODUCTION':
        return <Factory size={13} className="text-purple-400" />;
      case 'DIAGNOSTIC':
        return <BarChart3 size={13} className="text-blue-400" />;
      case 'COPILOT':
        return <TrendingUp size={13} className="text-emerald-400" />;
      default:
        return <Tag size={13} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
            <span>RESPONSABLE PRODUCTION</span>
            <span>/</span>
            <span className="text-slate-100">JOURNAL DES OPÉRATIONS & CADENCE</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
            <History className="text-purple-400" />
            Historique des Arbitrages & Performance Lignes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Journal des réajustements de cadence, bascules d'ordres MES, contrôles TRS et arrêts planifiés
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportHistoryAsCsv('PRODUCTION_MANAGER')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-purple-600/30"
          >
            <Download size={14} />
            <span>Exporter Journal Production CSV</span>
          </button>

          <button
            onClick={() => clearHistory('PRODUCTION_MANAGER')}
            title="Réinitialiser l'historique production"
            className="p-2 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 rounded-xl transition text-xs"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="industrial-card p-4 border-purple-900/40">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Total Actions Lignes</p>
          <p className="text-2xl font-black text-white font-mono">{actions.length}</p>
          <span className="text-[10px] text-purple-400 font-semibold">MES & TRS en direct</span>
        </div>

        <div className="industrial-card p-4 border-blue-900/40">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Audits TRS / OEE</p>
          <p className="text-2xl font-black text-blue-400 font-mono">
            {actions.filter((a) => a.action.includes('TRS') || a.action.includes('OEE')).length}
          </p>
          <span className="text-[10px] text-slate-400">Analyses d'efficience</span>
        </div>

        <div className="industrial-card p-4 border-amber-900/40">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Ajustements Cadence</p>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {actions.filter((a) => a.action.includes('CADENCE')).length}
          </p>
          <span className="text-[10px] text-amber-400 font-bold">Régimes de préservation</span>
        </div>

        <div className="industrial-card p-4 border-emerald-900/40">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Bascules Ordres MES</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {actions.filter((a) => a.action.includes('MES') || a.action.includes('REORDONNANCEMENT')).length}
          </p>
          <span className="text-[10px] text-emerald-400 font-bold">Continuité garantie</span>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
        <div className="relative flex-1 w-full md:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par action production, ligne, batch ou mot-clé..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="PRODUCTION">Production & MES</option>
            <option value="DIAGNOSTIC">Analyses & TRS</option>
            <option value="COPILOT">Assistance IA</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="CRITICAL">Critique</option>
            <option value="WARNING">Avertissement</option>
            <option value="SUCCESS">Succès</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-purple-400" />
            <span>Journal Chronologique Responsable Production ({filteredActions.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Flux temps réel</span>
        </div>

        {filteredActions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800/80">
            Aucune action ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Action Production</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Ligne / Machine</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Détails de l'événement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredActions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">
                      {act.userName}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-purple-300 text-[11px] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                        {act.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        {getCategoryIcon(act.category)}
                        <span>{act.category}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      {act.machineCode ? (
                        <span className="text-purple-400 font-bold bg-purple-950/60 border border-purple-800 px-1.5 py-0.5 rounded text-[10px]">
                          {act.machineCode}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(act.status)}`}>
                        {act.status || 'INFO'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-sans text-xs max-w-md">
                      {act.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
