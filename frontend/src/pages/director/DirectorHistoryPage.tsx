import React, { useState } from 'react';
import {
  History,
  Download,
  Search,
  Briefcase,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock,
  Trash2,
  FileSpreadsheet,
  Bot,
  Tag
} from 'lucide-react';
import { useHistoryStore } from '../../store/useHistoryStore.js';
import { ActionCategory } from '../../types/index.js';
import { useNavigate } from 'react-router-dom';

export const DirectorHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { getActionsByRole, exportHistoryAsCsv, clearHistory } = useHistoryStore();
  const actions = getActionsByRole('INDUSTRIAL_DIRECTOR');

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
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const getCategoryIcon = (category: ActionCategory) => {
    switch (category) {
      case 'STRATEGY':
        return <Briefcase size={13} className="text-amber-400" />;
      case 'EXPORT':
        return <FileSpreadsheet size={13} className="text-emerald-400" />;
      case 'COPILOT':
        return <Bot size={13} className="text-blue-400" />;
      default:
        return <Tag size={13} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>DIRECTEUR INDUSTRIEL</span>
            <span>/</span>
            <span className="text-slate-100">JOURNAL DES DÉCISIONS STRATÉGIQUES</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
            <History className="text-amber-400" />
            Historique des Décisions Exécutives & Audits Direction
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Journal de gouvernance : approbations budgétaires CAPEX, exports de gestion CSV, synthèses IA et suivi de rentabilité ROI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/director/exports')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Centre d'Exports CSV</span>
          </button>

          <button
            onClick={() => exportHistoryAsCsv('INDUSTRIAL_DIRECTOR')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-amber-600/30"
          >
            <Download size={14} />
            <span>Exporter Journal Direction</span>
          </button>

          <button
            onClick={() => clearHistory('INDUSTRIAL_DIRECTOR')}
            title="Réinitialiser l'historique direction"
            className="p-2 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 rounded-xl transition text-xs"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="industrial-card p-4 border-amber-900/40">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Total Décisions</p>
          <p className="text-2xl font-black text-white font-mono">{actions.length}</p>
          <span className="text-[10px] text-amber-400 font-semibold">Traçabilité de gouvernance</span>
        </div>

        <div className="industrial-card p-4 border-emerald-900/40">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Exports CSV Réalisés</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {actions.filter((a) => a.category === 'EXPORT').length}
          </p>
          <span className="text-[10px] text-slate-400">Pour Power BI & Reporting</span>
        </div>

        <div className="industrial-card p-4 border-blue-900/40">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Synthèses IA</p>
          <p className="text-2xl font-black text-blue-400 font-mono">
            {actions.filter((a) => a.category === 'STRATEGY' || a.category === 'COPILOT').length}
          </p>
          <span className="text-[10px] text-blue-400 font-bold">Décisions éclairées par RAG</span>
        </div>

        <div className="industrial-card p-4 border-purple-900/40">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Validations CAPEX</p>
          <p className="text-2xl font-black text-purple-400 font-mono">
            {actions.filter((a) => a.action.includes('BUDGET') || a.action.includes('CAPEX')).length}
          </p>
          <span className="text-[10px] text-emerald-400 font-bold">ROI sécurisé (+214%)</span>
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
            placeholder="Rechercher par décision stratégique, export, budget ou mot-clé..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="STRATEGY">Stratégie & Gouvernance</option>
            <option value="EXPORT">Exports CSV & Reporting</option>
            <option value="COPILOT">Analyses Copilote IA</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
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
            <Clock size={16} className="text-amber-400" />
            <span>Journal Chronologique des Décisions Direction ({filteredActions.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Registre officiel</span>
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
                  <th className="p-3">Décisionnaire</th>
                  <th className="p-3">Nature de la Décision</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Périmètre</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Synthèse exécutive</th>
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
                      <span className="font-bold text-amber-300 text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
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
                        <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                          {act.machineCode}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">PARC GLOBAL</span>
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
