import React, { useEffect, useState } from 'react';
import { Bell, Bot, Clock, LogOut, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useStore.js';

export const TopHeader: React.FC = () => {
  const { activeRole, selectedMachineCode, isCopilotOpen, setCopilotOpen, liveConnected, logoutUser } = useAppStore();
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
    navigate('/role-selection');
  };

  return (
    <header className="h-14 bg-[#0a0e1a]/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Machine & Status Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Machine:</span>
          <span className="text-sm font-bold text-white font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {selectedMachineCode}
          </span>
          <span className="text-xs text-slate-400 font-medium ml-2">Status:</span>
          <span className="px-2 py-0.5 text-[11px] font-bold bg-red-600/20 text-red-400 border border-red-500/40 rounded">
            Critical
          </span>
        </div>
      </div>

      {/* Live Indicators & Utilities */}
      <div className="flex items-center gap-5">
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
          <span>AI Copilot (RAG)</span>
        </button>

        {/* Notification Badge */}
        <div className="relative cursor-pointer text-slate-400 hover:text-white">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
          />
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 hover:border-red-700/60 transition"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};
