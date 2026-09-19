import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Settings2, Factory, Briefcase, ChevronRight, Shield, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useStore.js';
import { RoleType } from '../types/index.js';

export const RoleSelectionPage: React.FC = () => {
  const { setActiveRole } = useAppStore();
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSelectRole = (role: RoleType, path: string) => {
    setActiveRole(role);
    navigate(path);
  };

  const handleAdminAccess = () => {
    if (pin === 'admin123') {
      setActiveRole('ADMIN');
      navigate('/admin');
    } else {
      setPinError('Code PIN invalide. Réessayez.');
      setPin('');
    }
  };

  const openAdminModal = () => {
    setShowAdminModal(true);
    setPin('');
    setPinError('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Lueur radiale douce d'arrière-plan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Titre principal & Marque */}
      <div className="text-center max-w-3xl mb-12 z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-600/30">
            M
          </div>
          <h1 className="text-4xl font-extrabold tracking-wider font-mono text-slate-900">MAINTIX</h1>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-wide">
          Extension d'Intelligence Décisionnelle IA pour les Opérations Industrielles
        </h2>
        <p className="text-sm font-bold text-emerald-600 tracking-widest uppercase">
          Connecter • Prédire • Optimiser
        </p>
      </div>

      {/* Grille des 4 rôles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full z-10">
        {/* 1. TECHNICIEN */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition">
              <Wrench size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-wide">TECHNICIEN</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Surveiller les machines, diagnostiquer les pannes et recevoir l'assistance IA.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('TECHNICIAN', '/technician/overview')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 2. RESPONSABLE MAINTENANCE */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition">
              <Settings2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-wide">RESP. MAINTENANCE</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Planifier la maintenance, gérer les équipes et réduire les arrêts machine.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('MAINTENANCE_MANAGER', '/maintenance/overview')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 3. RESPONSABLE PRODUCTION */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition">
              <Factory size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-wide">RESP. PRODUCTION</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Suivre la production, analyser les performances et optimiser les lignes.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('PRODUCTION_MANAGER', '/production/overview')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 4. DIRECTEUR INDUSTRIEL */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group hover:-translate-y-1">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-wide">DIRECTEUR INDUSTRIEL</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Accéder aux KPIs, analyser l'impact financier et prendre des décisions stratégiques.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('INDUSTRIAL_DIRECTOR', '/director/overview')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
          >
            <span>Accéder</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-16 text-center text-xs text-slate-500 z-10 space-y-1">
        <p className="font-semibold text-slate-600">Sécurisé • Temps réel • Intelligent</p>
        <p>Propulsé par l'IA • Intégré à vos systèmes industriels</p>
        {/* Lien Admin discret */}
        <button
          onClick={openAdminModal}
          className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-emerald-700 transition-colors duration-300 font-mono tracking-widest font-semibold"
        >
          <Shield size={12} />
          <span>ACCÈS ADMINISTRATEUR</span>
        </button>
      </div>

      {/* Modal PIN Admin */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-sm shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Lock size={28} />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 text-center mb-1 font-mono tracking-wider">
              ACCÈS RESTREINT
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Saisissez le code PIN administrateur pour accéder au panneau de contrôle.
            </p>

            <div className="relative mb-3">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
                placeholder="Code PIN (admin123)"
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition font-mono tracking-widest text-center"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {pinError && (
              <p className="text-xs text-red-600 text-center mb-3 font-semibold">{pinError}</p>
            )}

            <button
              onClick={handleAdminAccess}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
            >
              <Shield size={16} />
              Confirmer l'accès
            </button>

            <p className="text-[10px] text-slate-500 text-center mt-4 font-mono">
              Toutes les actions administrateur sont auditées et enregistrées.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
