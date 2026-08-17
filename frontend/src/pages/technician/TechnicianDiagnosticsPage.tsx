import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Wrench,
  Bot
} from 'lucide-react';
import { useTechnicianOverview } from '../../hooks/useTechnicianData.js';
import { useAppStore } from '../../store/useStore.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const TechnicianDiagnosticsPage: React.FC = () => {
  const navigate = useNavigate();
  const overviewQuery = useTechnicianOverview('PCL-GMX-001');
  const { setAiDrawerOpen } = useAppStore();

  return (
    <QueryStateWrapper query={overviewQuery}>
      {({ machine }: any) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
                <span>ESPACE TECHNICIEN</span>
                <span>/</span>
                <span>DIAGNOSTIC ÉQUIPEMENT</span>
                <span>/</span>
                <span className="text-slate-100">{machine?.code || 'PCL-GMX-001'}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Sparkles className="text-blue-400" />
                Diagnostic Causes Racines & Synthèse RAG
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Corrélation télémétrique physique, modes de défaillance ISO et instructions correctives automatisées</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setAiDrawerOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow transition"
              >
                <Bot size={15} /> Consulter le Copilote IA RAG
              </button>
            </div>
          </div>

          {/* Diagnostic principal */}
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold font-mono">
                    ● CAUSE RACINE CRITIQUE IDENTIFIÉE
                  </span>
                  <span className="text-xs font-mono text-slate-400">Confiance : 94,2%</span>
                </div>

                <h2 className="text-2xl font-black text-white">
                  Roulement Arbre Moteur Principal — Écaillage Piste Externe Stade 3
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  L'accéléromètre vibratoire haute fréquence (<code className="text-blue-400 font-mono">SENS-VIB-01</code>) a enregistré un pic harmonique sévère à <strong>11,2 mm/s RMS</strong> (violation zone D ISO 10816-3). La montée thermique synchrone de <strong>62,5°C</strong> sur le carter gauche confirme la friction mécanique et la fatigue de surface du roulement SKF 6208.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="bg-slate-950/80 px-2.5 py-1 rounded text-slate-300 border border-slate-800">
                    Durée de vie restante : <strong className="text-red-400">18 jours</strong>
                  </span>
                  <span className="bg-slate-950/80 px-2.5 py-1 rounded text-slate-300 border border-slate-800">
                    Risque de panne : <strong className="text-red-400">88%</strong>
                  </span>
                  <span className="bg-slate-950/80 px-2.5 py-1 rounded text-slate-300 border border-slate-800">
                    Fenêtre recommandée : <strong className="text-amber-400">48h (Pause de quart)</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-2 shrink-0">
                <button
                  onClick={() => navigate('/technician/work-orders')}
                  className="w-full px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Wrench size={15} /> Créer Ordre de Travail Correctif
                </button>
                <button
                  onClick={() => navigate(`/technician/machines/${machine?.code || 'PCL-GMX-001'}/sensors`)}
                  className="w-full px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  Inspecter la Grille Capteurs en Direct
                </button>
              </div>
            </div>
          </div>

          {/* Étapes d'action corrective */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              Procédure Corrective Standard (Manuel Maintenance Picanol GamMax §4.2)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-blue-400 font-bold">ÉTAPE 1 • ISOLEMENT & LOTO</span>
                <p className="text-slate-300 font-sans">
                  Activer l'arrêt d'urgence (S1). Consigner le disjoncteur principal 400V triphasé au panneau Baie 4. Relâcher la tension de chaîne.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-blue-400 font-bold">ÉTAPE 2 • DÉMONTAGE & EXTRACTION ROULEMENT</span>
                <p className="text-slate-300 font-sans">
                  Dévisser les boulons de fixation M12 du carter. Utiliser l'extracteur hydraulique mécanique SKF TMHP 10E sur l'arbre moteur gauche. Extraire le roulement SKF 6208 usé.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-blue-400 font-bold">ÉTAPE 3 • REMPLACEMENT & CALIBRATION</span>
                <p className="text-slate-300 font-sans">
                  Chauffer le nouveau roulement SKF 6208-2RS1 à 110°C sur chauffage par induction. Monter et emboîter. Lubrifier avec graisse Klüberplex BEM 41-132. Serrer les boulons à 85 Nm.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
