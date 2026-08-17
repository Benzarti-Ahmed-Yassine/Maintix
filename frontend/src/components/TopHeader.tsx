import React, { useEffect, useState } from 'react';
import { Bell, Bot, Clock, LogOut, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useStore.js';

export const TopHeader: React.FC = () => {
  const { activeRole, currentUser, selectedMachineCode, isCopilotOpen, setCopilotOpen, liveConnected, logoutUser } = useAppStore();
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
        return { name: currentUser?.name || 'Sonia Trabelsi', role: 'Resp. Maintenance', color: 'text-teal-400 border-teal-800 bg-teal-950/60' };
      case 'PRODUCTION_MANAGER':
        return { name: currentUser?.name || 'Tarek Mansour', role: 'Resp. Production', color: 'text-purple-400 border-purple-800 bg-purple-950/60' };
      case 'INDUSTRIAL_DIRECTOR':
        return { name: currentUser?.name || 'Dr. Yassine Benzarti', role: 'Directeur Industriel', color: 'text-amber-400 border-amber-800 bg-amber-950/60' };
      case 'ADMIN':
        return { name: currentUser?.name || 'Admin Système', role: 'Admin', color: 'text-red-400 border-red-800 bg-red-950/60' };
      case 'TECHNICIAN':
      default:
        return { name: currentUser?.name || 'Karim Ben Salem', role: 'Technicien L1', color: 'text-blue-400 border-blue-800 bg-blue-950/60' };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <header className="h-14 bg-[#0a0e1a]/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Machine & Status Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Machine :</span>
          <span className="text-sm font-bold text-white font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {selectedMachineCode}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-2">Statut :</span>
          <span className="px-2 py-0.5 text-[11px] font-bold bg-red-600/20 text-red-400 border border-red-500/40 rounded">
            Alerte
          </span>
        </div>
      </div>

      {/* Live Indicators & Utilities */}
      <div className="flex items-center gap-4">
        {/* Live Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/80 rounded-full text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>● LIVE</span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Clock size={14} className="text-slate-400" />
          <span>{timeStr || '10:24:53'}</span>
        </div>

        {/* AI Copilot RAG Launcher */}
        <button
          onClick={() => setCopilotOpen(!isCopilotOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition border ${
            isCopilotOpen
              ? 'bg-blue-600 text-white border-blue-400'
              : 'bg-slate-800 text-blue-300 border-slate-700 hover:border-blue-500'
          }`}
        >
          <Bot size={14} />
          <span>Copilote IA (RAG)</span>
        </button>

        {/* User Profile Badge & Logout */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-tight">{roleInfo.name}</p>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold inline-block mt-0.5 ${roleInfo.color}`}>
              {roleInfo.role}
            </span>
          </div>

          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
          />

          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 hover:border-red-700/60 transition"
          >
            <LogOut size={14} />
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

