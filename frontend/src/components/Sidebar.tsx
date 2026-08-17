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
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../store/useStore.js';

export const Sidebar: React.FC = () => {
  const { currentUser, setActiveRole, logoutUser } = useAppStore();
  const role = currentUser?.role || 'TECHNICIAN';
  const navigate = useNavigate();

  const handleSwitchRole = () => {
    setActiveRole(null);
    navigate('/role-selection');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/role-selection');
  };

  const technicianLinks = [
    { to: '/technician/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/technician/machines', label: 'Machines & 3D', icon: <Cpu size={18} /> },
    { to: '/technician/machines/PCL-GMX-001/sensors', label: 'Télémétrie Capteurs', icon: <Radio size={18} /> },
    { to: '/technician/alerts', label: 'Alertes Actives', icon: <AlertTriangle size={18} /> },
    { to: '/technician/diagnostics', label: 'Diagnostics IA', icon: <Sparkles size={18} /> },
    { to: '/technician/work-orders', label: 'Ordres de Travail', icon: <Wrench size={18} /> },
    { to: '/technician/procedures', label: 'Procédures SOP', icon: <FileText size={18} /> },
    { to: '/technician/spare-parts', label: 'Pièces de Rechange', icon: <Package size={18} /> },
    { to: '/technician/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const maintenanceLinks = [
    { to: '/maintenance/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/maintenance/sensors', label: 'Analyse Capteurs', icon: <Radio size={18} /> },
    { to: '/maintenance/risks', label: 'Analyse des Risques', icon: <ShieldAlert size={18} /> },
    { to: '/maintenance/work-orders', label: 'Ordres de Travail (GMAO)', icon: <Wrench size={18} /> },
    { to: '/maintenance/plans', label: 'Plans de Maintenance', icon: <Calendar size={18} /> },
    { to: '/maintenance/technicians', label: 'Équipe Techniciens', icon: <Users size={18} /> },
    { to: '/maintenance/spare-parts', label: 'Inventaire Pièces', icon: <Package size={18} /> },
    { to: '/maintenance/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const productionLinks = [
    { to: '/production/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/production/lines', label: 'Lignes de Production', icon: <Layers size={18} /> },
    { to: '/production/oee', label: 'Analyse TRS', icon: <BarChart3 size={18} /> },
    { to: '/production/performance', label: 'Performance & Cadence', icon: <TrendingUp size={18} /> },
    { to: '/production/downtime', label: 'Arrêts & Pertes', icon: <Clock size={18} /> },
    { to: '/production/quality', label: 'Contrôle Qualité', icon: <CheckCircle2 size={18} /> },
    { to: '/production/orders', label: 'Ordres MES', icon: <FileText size={18} /> },
    { to: '/production/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const directorLinks = [
    { to: '/director/overview', label: 'Vue d\'ensemble', icon: <Activity size={18} /> },
    { to: '/director/kpis', label: 'KPIs Stratégiques', icon: <BarChart3 size={18} /> },
    { to: '/director/analytics', label: 'Impact Financier & ROI', icon: <TrendingUp size={18} /> },
    { to: '/director/operations', label: 'Opérations Usine', icon: <Layers size={18} /> },
    { to: '/director/systems', label: 'Architecture OT/IT', icon: <Share2 size={18} /> },
    { to: '/director/ai-insights', label: 'Synthèses IA Direction', icon: <Sparkles size={18} /> },
    { to: '/director/ai', label: 'Copilote IA RAG', icon: <Bot size={18} /> },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Panneau de Contrôle', icon: <Settings size={18} /> },
    { to: '/admin/demo', label: 'Centre Démo & Scénarios', icon: <Sparkles size={18} /> },
    { to: '/admin/machines', label: 'Machines & Import', icon: <Cpu size={18} /> },
    { to: '/admin/components', label: 'Composants & 3D', icon: <Layers size={18} /> },
    { to: '/admin/integrations', label: 'ERP / MES / SCADA', icon: <Share2 size={18} /> },
    { to: '/admin/rag', label: 'Validation Base RAG', icon: <FileText size={18} /> },
    { to: '/admin/models', label: 'MLOps & Réentraînement', icon: <Sliders size={18} /> },
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
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Marque */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-white text-sm">
            M
          </div>
          <div>
            <span className="font-black tracking-wider text-base text-white font-mono">MAINTIX</span>
            <span className="text-[10px] text-blue-400 block font-mono">PLATEFORME IA INDUSTRIELLE</span>
          </div>
        </div>

        {/* Badge rôle actif */}
        <div className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${roleColor}`}>
          <span>{roleTitle}</span>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
        </div>

        {/* Liens de navigation */}
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Pied de page */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* Factory Info */}
        <div className="text-[11px] font-mono text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>FACTORY-TN-01</span>
            <span className="text-emerald-400 font-bold">EN LIGNE</span>
          </div>
          <div className="text-[10px] text-slate-600">Usine Textile Démo Tunisie</div>
        </div>

        {/* Changer de rôle */}
        <button
          onClick={handleSwitchRole}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 transition group"
        >
          <RefreshCw size={14} className="text-slate-400 group-hover:text-blue-400 transition" />
          <span>Changer de rôle</span>
        </button>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 hover:border-red-700/60 transition group"
        >
          <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
