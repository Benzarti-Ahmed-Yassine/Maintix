import React, { useEffect, useState } from 'react';
import { Bell, Bot, Clock, LogOut, Radio, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useStore.js';

export const TopHeader: React.FC = () => {
  const {
    activeRole,
    currentUser,
    selectedMachineCode,
    isCopilotOpen,
    setCopilotOpen,
    liveConnected,
    logoutUser,
    theme,
    toggleTheme
  } = useAppStore();
  const [timeStr, setTimeStr] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/role-selection', { replace: true });
  };

  const getRoleLabel = () => {
    switch (activeRole || currentUser?.role) {
      case 'MAINTENANCE_MANAGER':
        return { name: currentUser?.name || 'Sonia Trabelsi', role: 'Resp. Maintenance', color: 'text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60' };
      case 'PRODUCTION_MANAGER':
        return { name: currentUser?.name || 'Tarek Mansour', role: 'Resp. Production', color: 'text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60' };
      case 'INDUSTRIAL_DIRECTOR':
        return { name: currentUser?.name || 'Dr. Yassine Benzarti', role: 'Directeur Industriel', color: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60' };
      case 'ADMIN':
        return { name: currentUser?.name || 'Admin Système', role: 'Admin', color: 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/60' };
      case 'TECHNICIAN':
      default:
        return { name: currentUser?.name || 'Karim Ben Salem', role: 'Technicien L1', color: 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60' };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <header className="h-14 bg-white/95 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Machine & Status Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Machine :</span>
          <span className="text-sm font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {selectedMachineCode}
          </span>
          <span className="text-xs text-slate-500 font-medium ml-2">Statut :</span>
          <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 rounded">
            Nominal / Surveillance
          </span>
        </div>

        {/* Production Mode Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[11px] font-bold">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>PRODUCTION</span>
        </div>
      </div>

      {/* Live Indicators & Utilities */}
      <div className="flex items-center gap-3.5">
        {/* Live Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>● LIVE</span>
        </div>

        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-mono">
          <Clock size={14} className="text-slate-400" />
          <span>{timeStr || '10:24:53'}</span>
        </div>

        {/* AI Copilot RAG Launcher - White & Green Emerald theme */}
        <button
          onClick={() => setCopilotOpen(!isCopilotOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border shadow-sm ${
            isCopilotOpen
              ? 'bg-emerald-700 text-white border-emerald-600 shadow-emerald-700/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-600/20'
          }`}
        >
          <Bot size={15} />
          <span>Copilote IA (RAG)</span>
        </button>

        {/* User Profile Badge & Logout */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{roleInfo.name}</p>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold inline-block mt-0.5 ${roleInfo.color}`}>
              {roleInfo.role}
            </span>
          </div>

          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
          />

          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/40 transition"
          >
            <LogOut size={14} />
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

