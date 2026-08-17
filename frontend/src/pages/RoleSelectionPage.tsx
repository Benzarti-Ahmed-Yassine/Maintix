import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Settings2, Factory, Briefcase, ChevronRight, Cpu } from 'lucide-react';
import { useAppStore } from '../store/useStore.js';
import { RoleType } from '../types/index.js';

export const RoleSelectionPage: React.FC = () => {
  const { setActiveRole } = useAppStore();
  const navigate = useNavigate();

  const handleSelectRole = (role: RoleType, path: string) => {
    setActiveRole(role);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Lueur radiale d'arrière-plan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-900/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Titre principal & Marque */}
      <div className="text-center max-w-3xl mb-12 z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-600/30">
            M
          </div>
          <h1 className="text-4xl font-extrabold tracking-wider font-mono text-white">MAINTIX</h1>
        </div>

        <h2 className="text-2xl font-bold text-slate-200 mb-2 tracking-wide">
          Extension d'Intelligence Décisionnelle IA pour les Opérations Industrielles
        </h2>
        <p className="text-sm font-semibold text-blue-400 tracking-widest uppercase">
          Connecter. Prédire. Optimiser.
        </p>
      </div>

      {/* Grille des 4 rôles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full z-10">
        {/* 1. TECHNICIEN */}
        <div className="industrial-card p-6 flex flex-col justify-between border-blue-900/60 hover:border-blue-500/80 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition">
              <Wrench size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">TECHNICIEN</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Surveiller les machines, diagnostiquer les pannes et recevoir l'assistance IA.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('TECHNICIAN', '/technician/overview')}
            className="w-full py-2.5 px-4 bg-blue-700/80 hover:bg-blue-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 2. RESPONSABLE MAINTENANCE */}
        <div className="industrial-card p-6 flex flex-col justify-between border-teal-900/60 hover:border-teal-500/80 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-xl bg-teal-950/80 border border-teal-800/80 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition">
              <Settings2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">RESP. MAINTENANCE</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Planifier la maintenance, gérer les équipes et réduire les arrêts machine.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('MAINTENANCE_MANAGER', '/maintenance/overview')}
            className="w-full py-2.5 px-4 bg-teal-700/80 hover:bg-teal-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 3. RESPONSABLE PRODUCTION */}
        <div className="industrial-card p-6 flex flex-col justify-between border-purple-900/60 hover:border-purple-500/80 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition">
              <Factory size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">RESP. PRODUCTION</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Suivre la production, analyser les performances et optimiser les lignes.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('PRODUCTION_MANAGER', '/production/overview')}
            className="w-full py-2.5 px-4 bg-purple-700/80 hover:bg-purple-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 4. DIRECTEUR INDUSTRIEL */}
        <div className="industrial-card p-6 flex flex-col justify-between border-amber-900/60 hover:border-amber-500/80 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">DIRECTEUR INDUSTRIEL</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Accéder aux KPIs, analyser l'impact financier et prendre des décisions stratégiques.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('INDUSTRIAL_DIRECTOR', '/director/overview')}
            className="w-full py-2.5 px-4 bg-amber-700/80 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-16 text-center text-xs text-slate-500 z-10 space-y-1">
        <p className="font-semibold text-slate-400">Sécurisé • Temps réel • Intelligent</p>
        <p>Propulsé par l'IA • Intégré à vos systèmes</p>
      </div>
    </div>
  );
};
