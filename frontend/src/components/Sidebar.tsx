import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Layers,
  Wrench,
  BarChart3,
  ShieldAlert,
  Settings,
  Cpu,
  Calendar,
  AlertTriangle,
  FileText,
  Bot,
  Package,
  Clock,
  TrendingUp,
  Share2,
  Users,
  Database,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Sparkles,
  Play,
  LogOut,
  RefreshCw,
  History
} from 'lucide-react';
import { useAppStore } from '../store/useStore.js';

export const Sidebar: React.FC = () => {
  const { currentUser, activeRole, setActiveRole, logoutUser, setCopilotOpen } = useAppStore();
  const role = activeRole || currentUser?.role || 'TECHNICIAN';
  const navigate = useNavigate();

  const handleSwitchRole = () => {
    setActiveRole(null);
    navigate('/role-selection', { replace: true });
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/role-selection', { replace: true });
  };

  const technicianLinks = [
    { to: '/technician/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/technician/machines', label: 'Machines & 3D', icon: <Cpu size={18} /> },
    { to: '/technician/machines/PCL-GMX-001/sensors', label: 'Télémétrie Capteurs', icon: <Radio size={18} /> },
    { to: '/technician/ml-insights', label: 'Intelligence ML & Pronostic', icon: <Sparkles size={18} /> },
    { to: '/technician/alerts', label: 'Alertes Actives', icon: <AlertTriangle size={18} /> },
    { to: '/technician/diagnostics', label: 'Diagnostics IA', icon: <TrendingUp size={18} /> },
    { to: '/technician/work-orders', label: 'Ordres de Travail', icon: <Wrench size={18} /> },
    { to: '/technician/procedures', label: 'Procédures SOP', icon: <FileText size={18} /> },
    { to: '/technician/spare-parts', label: 'Pièces de Rechange', icon: <Package size={18} /> },
    { to: '/technician/history', label: 'Journal des Actions', icon: <History size={18} /> },
    { to: '/technician/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const maintenanceLinks = [
    { to: '/maintenance/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/maintenance/ml-insights', label: 'Intelligence ML & Pronostic', icon: <Sparkles size={18} /> },
    { to: '/maintenance/sensors', label: 'Analyse Capteurs', icon: <Radio size={18} /> },
    { to: '/maintenance/risks', label: 'Analyse des Risques', icon: <ShieldAlert size={18} /> },
    { to: '/maintenance/work-orders', label: 'Ordres de Travail (GMAO)', icon: <Wrench size={18} /> },
    { to: '/maintenance/plans', label: 'Plans de Maintenance', icon: <Calendar size={18} /> },
    { to: '/maintenance/technicians', label: 'Équipe Techniciens', icon: <Users size={18} /> },
    { to: '/maintenance/spare-parts', label: 'Inventaire Pièces', icon: <Package size={18} /> },
    { to: '/maintenance/history', label: 'Journal des Décisions', icon: <History size={18} /> },
    { to: '/maintenance/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const productionLinks = [
    { to: '/production/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/production/lines', label: 'Lignes de Production', icon: <Layers size={18} /> },
    { to: '/production/ml-insights', label: 'Pronostics IA & Cadence', icon: <Sparkles size={18} /> },
    { to: '/production/oee', label: 'Analyse TRS', icon: <BarChart3 size={18} /> },
    { to: '/production/performance', label: 'Performance & Cadence', icon: <TrendingUp size={18} /> },
    { to: '/production/downtime', label: 'Arrêts & Pertes', icon: <Clock size={18} /> },
    { to: '/production/quality', label: 'Contrôle Qualité', icon: <CheckCircle2 size={18} /> },
    { to: '/production/orders', label: 'Ordres MES', icon: <FileText size={18} /> },
    { to: '/production/history', label: 'Journal des Opérations', icon: <History size={18} /> },
    { to: '/production/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const directorLinks = [
    { to: '/director/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/director/kpis', label: 'KPIs Stratégiques', icon: <BarChart3 size={18} /> },
    { to: '/director/ml-insights', label: 'Intelligence ML & Arbitrage', icon: <Sparkles size={18} /> },
    { to: '/director/analytics', label: 'Impact Financier & ROI', icon: <TrendingUp size={18} /> },
    { to: '/director/operations', label: 'Opérations Usine', icon: <Layers size={18} /> },
    { to: '/director/systems', label: 'Architecture OT/IT', icon: <Share2 size={18} /> },
    { to: '/director/exports', label: 'Exports CSV Management', icon: <FileSpreadsheet size={18} /> },
    { to: '/director/history', label: 'Journal des Décisions', icon: <History size={18} /> },
    { to: '/director/ai-insights', label: 'Synthèses IA Direction', icon: <Bot size={18} /> },
    { to: '/director/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Panneau de Contrôle', icon: <Settings size={18} /> },
    { to: '/admin/models', label: 'Hub Intelligence ML & MLOps', icon: <Sparkles size={18} /> },
    { to: '/admin/demo', label: 'Centre Démo & Scénarios', icon: <Play size={18} /> },
    { to: '/admin/machines', label: 'Machines & Import', icon: <Cpu size={18} /> },
    { to: '/admin/components', label: 'Composants & 3D', icon: <Layers size={18} /> },
    { to: '/admin/integrations', label: 'ERP / MES / SCADA', icon: <Share2 size={18} /> },
    { to: '/admin/rag', label: 'Validation Base RAG', icon: <FileText size={18} /> },
    { to: '/admin/bi-datasets', label: 'Datasets Star-Schema BI', icon: <FileSpreadsheet size={18} /> },
    { to: '/admin/datasets', label: 'Lac de Données Médaillon', icon: <Database size={18} /> },
    { to: '/admin/audit', label: 'Journal d\'Audit Sécurité', icon: <ShieldAlert size={18} /> },
  ];


  let links = technicianLinks;
  let roleColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  let roleTitle = 'Espace Technicien';

  if (role === 'MAINTENANCE_MANAGER') {
    links = maintenanceLinks;
    roleColor = 'text-teal-400 border-teal-500/30 bg-teal-500/10';
    roleTitle = 'Resp. Maintenance';
  } else if (role === 'PRODUCTION_MANAGER') {
    links = productionLinks;
    roleColor = 'text-purple-400 border-purple-500/30 bg-purple-500/10';
    roleTitle = 'Resp. Production';
  } else if (role === 'INDUSTRIAL_DIRECTOR') {
    links = directorLinks;
    roleColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    roleTitle = 'Directeur Industriel';
  } else if (role === 'ADMIN') {
    links = adminLinks;
    roleColor = 'text-red-400 border-red-500/30 bg-red-500/10';
    roleTitle = 'Admin Plateforme';
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm">
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Marque */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-white text-sm">
            M
          </div>
          <div>
            <span className="font-black tracking-wider text-base text-slate-900 font-mono">MAINTIX</span>
            <span className="text-[10px] text-emerald-600 block font-mono font-semibold">PLATEFORME IA INDUSTRIELLE</span>
          </div>
        </div>

        {/* Badge rôle actif */}
        <div className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${roleColor}`}>
          <span>{roleTitle}</span>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
        </div>

        {/* Liens de navigation */}
        <nav className="space-y-1">
          {links
            .filter((link) => !link.to.endsWith('/ai') && !link.to.endsWith('/ai-insights'))
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-sm'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/50'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
        </nav>

        {/* ── AI Copilot Premium Entry (White & Green Theme) ── */}
        {links.filter((link) => link.to.endsWith('/ai') || link.to.endsWith('/ai-insights')).map((link) => (
          <div key={link.to} className="mt-3 relative group">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-25 blur-sm group-hover:opacity-50 transition-all duration-500 animate-pulse" />

            <NavLink
              to={link.to}
              onClick={() => setCopilotOpen(true)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold border transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-700 to-teal-700 border-emerald-600 text-white shadow-lg shadow-emerald-700/30'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20'
                }`
              }
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

              {/* Icon with ring */}
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shadow-md">
                  <Bot size={15} className="text-white" />
                </div>
                {/* Pulsing ring */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-700 animate-ping opacity-75" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-700" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="truncate">{link.label}</span>
              </div>
            </NavLink>
          </div>
        ))}
      </div>

      {/* Pied de page */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Changer de rôle */}
        <button
          onClick={handleSwitchRole}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 transition group"
        >
          <RefreshCw size={14} className="text-slate-400 group-hover:text-blue-500 transition" />
          <span>Changer de rôle</span>
        </button>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/40 transition group"
        >
          <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
