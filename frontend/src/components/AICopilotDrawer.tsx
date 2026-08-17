import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  X,
  ShieldAlert,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Clock,
  Sliders,
  Play,
  RotateCcw,
  Activity,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '../store/useStore.js';
import { useHistoryStore } from '../store/useHistoryStore.js';
import { runLocalMlInference, queryAiCopilot, TelemetryInputs, FullMlInferenceOutput } from '../api/mlInference.js';
import axios from 'axios';

interface Message {
  sender: 'USER' | 'AI';
  text: string;
  confidence?: number;
  sources?: { title: string; snippet: string }[];
  actions?: string[];
  evidence?: string[];
  feedbackSent?: boolean;
  timestamp?: string;
}

export const AICopilotDrawer: React.FC = () => {
  const { activeRole, selectedMachineCode, isCopilotOpen, setCopilotOpen, triggerRefresh } = useAppStore();
  const { addAction } = useHistoryStore();

  // Active Tab: 'CHAT' or 'ML_TESTER'
  const [activeTab, setActiveTab] = useState<'CHAT' | 'ML_TESTER'>('CHAT');

  // Chat State
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [woSuccessMsg, setWoSuccessMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Interactive ML Sandbox State
  const [testInputs, setTestInputs] = useState<TelemetryInputs>({
    machineCode: selectedMachineCode || 'TX-1250-A',
    vibRms: 11.2,
    vibPeak: 14.8,
    tempBearing: 62.5,
    tempMotor: 48.5,
    current: 4.8,
    voltage: 400.0,
    speedRpm: 1450.0
  });

  const [mlOutput, setMlOutput] = useState<FullMlInferenceOutput>(runLocalMlInference(testInputs));

  // Update ML output whenever sliders change
  useEffect(() => {
    const res = runLocalMlInference(testInputs);
    setMlOutput(res);
  }, [testInputs]);

  // Keep machineCode in sync
  useEffect(() => {
    setTestInputs((prev) => ({ ...prev, machineCode: selectedMachineCode || 'TX-1250-A' }));
  }, [selectedMachineCode]);

  // Role prompt suggestions
  const roleSuggestions: Record<string, string[]> = {
    TECHNICIAN: [
      `Diagnostic vibration anormale sur ${selectedMachineCode}`,
      'Procédure de remplacement roulement SKF 6208',
      'Calculer le RUL restant avec télémétrie actuelle'
    ],
    MAINTENANCE_MANAGER: [
      'Évaluation criticité et probabilité de panne',
      'Recommandation Safe RL pour fenêtre d\'arrêt',
      'Impact sur les coûts de maintenance évitée'
    ],
    PRODUCTION_MANAGER: [
      'Impact de la dégradation machine sur le TRS Ligne 1',
      'Recommandation de réduction de cadence optimale',
      'Bascule du batch en cours vers Ligne 3'
    ],
    INDUSTRIAL_DIRECTOR: [
      'Calcul du ROI et coûts d\'arrêts évités YTD',
      'Synthèse de décision pour comité de direction',
      'Arbitrage budget maintenance prédictive'
    ],
    ADMIN: [
      'Statut des modèles MLOps Champion / Challenger',
      'Vérifier dérive de données (Drift monitor)',
      'Tester inférence LightGBM & AutoEncoder en direct'
    ]
  };

  if (!isCopilotOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || query).trim();
    if (!textToSend) return;

    setQuery('');
    setMessages((prev) => [
      ...prev,
      {
        sender: 'USER',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLoading(true);

    // Record action in history store
    addAction({
      role: activeRole || 'TECHNICIAN',
      userName: activeRole === 'INDUSTRIAL_DIRECTOR' ? 'Dr. Yassine Benzarti' : 'Opérateur Maintix',
      action: 'COPILOT_RAG_REQUETE',
      category: 'COPILOT',
      details: `Requête IA : "${textToSend.slice(0, 70)}..."`,
      machineCode: selectedMachineCode,
      status: 'INFO'
    });

    try {
      const response = await queryAiCopilot(
        textToSend,
        activeRole || 'TECHNICIAN',
        selectedMachineCode,
        testInputs
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: response.answer,
          confidence: response.confidence,
          sources: response.sources,
          evidence: response.evidence,
          actions: response.recommendedActions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectMlResultIntoChat = () => {
    setActiveTab('CHAT');
    const prompt = `Analyser les résultats de test ML pour ${testInputs.machineCode} : Vibration=${testInputs.vibRms} mm/s, Temp=${testInputs.tempBearing}°C, RUL=${mlOutput.rul.rulDays} jours, Action RL=${mlOutput.rlPolicy.recommendedAction}`;
    handleSend(prompt);
  };

  const handleCreateWorkOrder = async () => {
    try {
      await axios.post('/api/maintenance/work-orders', {
        machineId: selectedMachineCode,
        title: `Intervention IA : ${mlOutput.failure.affectedSubsystem} sur ${selectedMachineCode}`,
        description: `Ordre généré par le moteur ML. RUL estimé : ${mlOutput.rul.rulDays}j. Pièce requise : ${mlOutput.failure.recommendedPart}.`,
        priority: mlOutput.rul.healthIndex < 40 ? 'URGENT' : 'HIGH'
      });
    } catch (e) {
      // ignore
    }

    addAction({
      role: activeRole || 'TECHNICIAN',
      userName: activeRole === 'INDUSTRIAL_DIRECTOR' ? 'Dr. Yassine Benzarti' : 'Opérateur Maintix',
      action: 'ORDRE_TRAVAIL_ML_GENERE',
      category: 'MAINTENANCE',
      details: `Création Ordre de Travail généré par ML pour ${selectedMachineCode} (${mlOutput.failure.recommendedPart})`,
      machineCode: selectedMachineCode,
      status: 'CRITICAL'
    });

    triggerRefresh();
    setWoSuccessMsg(`✅ Ordre de travail créé pour ${selectedMachineCode} !`);
    setTimeout(() => setWoSuccessMsg(null), 4000);
  };

  const handleFeedback = (msgIdx: number, rating: 'HELPFUL' | 'NOT_HELPFUL') => {
    addAction({
      role: activeRole || 'TECHNICIAN',
      userName: activeRole === 'INDUSTRIAL_DIRECTOR' ? 'Dr. Yassine Benzarti' : 'Opérateur Maintix',
      action: 'FEEDBACK_ML_ENREGISTRE',
      category: 'COPILOT',
      details: `Feedback sur inférence ML : ${rating === 'HELPFUL' ? 'Validé (+1)' : 'Rejeté (-1)'}`,
      machineCode: selectedMachineCode,
      status: rating === 'HELPFUL' ? 'SUCCESS' : 'WARNING'
    });

    setMessages((prev) =>
      prev.map((m, idx) => (idx === msgIdx ? { ...m, feedbackSent: true } : m))
    );
  };

  const resetTelemetryToNominal = () => {
    setTestInputs({
      machineCode: selectedMachineCode || 'TX-1250-A',
      vibRms: 1.4,
      vibPeak: 2.1,
      tempBearing: 42.0,
      tempMotor: 45.0,
      current: 4.2,
      voltage: 400.0,
      speedRpm: 1450.0
    });
  };

  const setTelemetryToCriticalDegradation = () => {
    setTestInputs({
      machineCode: selectedMachineCode || 'TX-1250-A',
      vibRms: 11.2,
      vibPeak: 14.8,
      tempBearing: 65.0,
      tempMotor: 52.0,
      current: 5.8,
      voltage: 400.0,
      speedRpm: 1450.0
    });
  };

  const currentSuggestions = roleSuggestions[activeRole || 'TECHNICIAN'] || roleSuggestions.TECHNICIAN;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[450px] max-w-full bg-[#0d1322] border-l border-slate-800 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white font-mono">Moteur IA & RAG</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold font-mono bg-blue-900/60 text-blue-300 border-blue-700/50">
                {activeRole || 'TECHNICIAN'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cible : <span className="text-blue-400 font-mono font-bold">{selectedMachineCode}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setCopilotOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          title="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs Switcher: Live Copilot Chat vs ML Models Sandbox */}
      <div className="flex border-b border-slate-800 bg-slate-950/80 p-1 gap-1">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'CHAT'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles size={13} />
          <span>Copilote RAG</span>
        </button>

        <button
          onClick={() => setActiveTab('ML_TESTER')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'ML_TESTER'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders size={13} />
          <span>Testeur Modèles ML</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {woSuccessMsg && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 p-2.5 text-xs text-emerald-300 text-center font-bold flex items-center justify-center gap-2">
          <CheckCircle2 size={14} />
          <span>{woSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: COPILOT RAG CHAT */}
      {activeTab === 'CHAT' && (
        <>
          {/* Suggestion Chips */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={11} className="text-blue-400" />
              Requêtes directes :
            </p>
            <div className="flex flex-col gap-1.5">
              {currentSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="text-left text-[11px] text-slate-300 hover:text-white bg-slate-900/80 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-700/60 rounded-lg px-2.5 py-1.5 transition truncate flex items-center justify-between group"
                >
                  <span className="truncate">{sug}</span>
                  <ChevronRight size={12} className="text-slate-500 group-hover:text-blue-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/60 mt-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mx-auto">
                  <Bot size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Prêt pour l'inférence</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Posez une question technique, demandez un diagnostic télémétrique ou basculez sur l'onglet <strong className="text-purple-400">Testeur Modèles ML</strong> pour simuler les capteurs.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                    msg.sender === 'USER'
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-100 ml-6 shadow-md'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200 mr-2 shadow-lg'
                  }`}
                >
                  {msg.sender === 'AI' && (
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Cpu size={13} /> Inférence Modèle & RAG
                      </span>
                      {msg.confidence && (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-800">
                          Confiance : {Math.round(msg.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-line font-normal text-slate-200">{msg.text}</p>

                  {msg.evidence && msg.evidence.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <ShieldAlert size={12} className="text-amber-400" />
                        Signaux physiques dominants :
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                        {msg.evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <FileText size={12} className="text-blue-400" />
                        Sources documentaires RAG :
                      </div>
                      {msg.sources.map((s, i) => (
                        <div key={i} className="text-[11px] bg-slate-950/80 border border-slate-800/80 p-2 rounded-lg mb-1 text-slate-300">
                          <span className="font-bold text-blue-400">{s.title} :</span> {s.snippet}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        Actions recommandées :
                      </div>
                      <div className="space-y-1.5">
                        {msg.actions.map((act, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/20 border border-emerald-900/30 p-1.5 rounded-lg">
                            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>

                      {activeRole === 'TECHNICIAN' && (
                        <button
                          onClick={handleCreateWorkOrder}
                          className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                        >
                          <Wrench size={14} />
                          <span>Créer l'Ordre de Travail</span>
                        </button>
                      )}
                    </div>
                  )}

                  {msg.sender === 'AI' && (
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {msg.timestamp || 'Temps réel'}
                      </span>

                      {msg.feedbackSent ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Feedback validé
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Précision ?</span>
                          <button
                            onClick={() => handleFeedback(idx, 'HELPFUL')}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition"
                            title="Pertinent"
                          >
                            <ThumbsUp size={13} />
                          </button>
                          <button
                            onClick={() => handleFeedback(idx, 'NOT_HELPFUL')}
                            className="p-1 text-slate-400 hover:text-red-400 transition"
                            title="Inexact"
                          >
                            <ThumbsDown size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-blue-900/50 text-xs text-blue-400 animate-pulse flex items-center gap-3">
                <Cpu size={18} className="animate-spin text-blue-400" />
                <div>
                  <p className="font-bold">Inférence ML en cours...</p>
                  <p className="text-[10px] text-slate-400">Calcul du score RUL & extraction RAG</p>
                </div>
              </div>
            )}
          </div>

          {/* Query Input */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Poser une question au modèle IA..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={!query.trim() || loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-lg shadow-blue-600/30 shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </>
      )}

      {/* TAB 2: INTERACTIVE ML MODELS TESTER & SANDBOX */}
      {activeTab === 'ML_TESTER' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Presets */}
          <div className="flex gap-2">
            <button
              onClick={resetTelemetryToNominal}
              className="flex-1 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw size={12} />
              <span>Régime Nominal (Zone A)</span>
            </button>

            <button
              onClick={setTelemetryToCriticalDegradation}
              className="flex-1 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <Zap size={12} />
              <span>Panne Roulement (Zone D)</span>
            </button>
          </div>

          {/* Sliders Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center justify-between">
              <span>🎛️ Paramètres Télémétriques d'Entrée</span>
              <span className="text-blue-400 font-mono">{testInputs.machineCode}</span>
            </h4>

            {/* Slider 1: Vibration RMS */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-300">Vibration RMS (mm/s) :</span>
                <span className={`font-bold ${testInputs.vibRms > 4.5 ? 'text-red-400' : testInputs.vibRms > 2.8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {testInputs.vibRms.toFixed(1)} mm/s ({mlOutput.rul.isoZone})
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.1"
                value={testInputs.vibRms}
                onChange={(e) => setTestInputs({ ...testInputs, vibRms: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Slider 2: Temp Bearing */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-300">Température Palier (°C) :</span>
                <span className={`font-bold ${testInputs.tempBearing > 60.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {testInputs.tempBearing.toFixed(1)} °C
                </span>
              </div>
              <input
                type="range"
                min="20.0"
                max="90.0"
                step="0.5"
                value={testInputs.tempBearing}
                onChange={(e) => setTestInputs({ ...testInputs, tempBearing: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            {/* Slider 3: Motor Temp */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-300">Température Moteur (°C) :</span>
                <span className="font-bold text-slate-200">{testInputs.tempMotor.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="20.0"
                max="95.0"
                step="0.5"
                value={testInputs.tempMotor}
                onChange={(e) => setTestInputs({ ...testInputs, tempMotor: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Slider 4: Current */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-300">Courant Moteur (A) :</span>
                <span className="font-bold text-slate-200">{testInputs.current.toFixed(1)} A</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.1"
                value={testInputs.current}
                onChange={(e) => setTestInputs({ ...testInputs, current: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Model 1: LightGBM RUL & Health Index */}
          <div className="bg-slate-900 border border-blue-900/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <Activity size={13} className="text-blue-400" />
                1. Prédiction RUL (LightGBM Champion)
              </span>
              <span className="text-[10px] font-mono text-blue-400">MAE: 1.42j</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <p className="text-[9px] text-slate-400">RUL Estimé</p>
                <p className={`text-base font-black ${mlOutput.rul.rulDays < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {mlOutput.rul.rulDays} jours
                </p>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <p className="text-[9px] text-slate-400">Indice Santé</p>
                <p className={`text-base font-black ${mlOutput.rul.healthIndex < 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {mlOutput.rul.healthIndex}/100
                </p>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <p className="text-[9px] text-slate-400">Prob. Panne</p>
                <p className="text-base font-black text-amber-400">
                  {Math.round(mlOutput.rul.failureProbability * 100)}%
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
              💡 {mlOutput.rul.recommendation}
            </p>
          </div>

          {/* Model 2: AutoEncoder Anomaly Detector */}
          <div className="bg-slate-900 border border-purple-900/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-purple-400" />
                2. Détection d'Anomalies (AutoEncoder)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                mlOutput.anomaly.severity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : mlOutput.anomaly.severity === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {mlOutput.anomaly.severity}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] pt-1">
              <span className="text-slate-400">Score d'anomalie :</span>
              <span className="font-bold text-white">{mlOutput.anomaly.anomalyScore.toFixed(3)} / 1.000</span>
            </div>

            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  mlOutput.anomaly.anomalyScore > 0.6 ? 'bg-red-500' : mlOutput.anomaly.anomalyScore > 0.3 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, mlOutput.anomaly.anomalyScore * 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-300">
              <strong>Diagnostic :</strong> {mlOutput.anomaly.anomalyType}
            </p>
          </div>

          {/* Model 3: Failure Classifier & Safe RL Policy */}
          <div className="bg-slate-900 border border-emerald-900/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <TrendingUp size={13} className="text-emerald-400" />
                3. Décision Safe RL & Impact Financier
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                +{mlOutput.rlPolicy.netSavingsUsd.toLocaleString()} $ net
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Action RL :</span>
                <span className="font-bold text-emerald-400">{mlOutput.rlPolicy.recommendedAction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coût Intervention :</span>
                <span className="text-slate-200">{mlOutput.rlPolicy.expectedCostUsd.toLocaleString()} $</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pertes Évitées :</span>
                <span className="text-emerald-400 font-bold">+{mlOutput.rlPolicy.avoidedLossUsd.toLocaleString()} $</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              {mlOutput.rlPolicy.rationale}
            </p>
          </div>

          {/* Actions from ML testing */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={handleInjectMlResultIntoChat}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-purple-600/30"
            >
              <Sparkles size={13} />
              <span>Interroger RAG sur ce test</span>
            </button>

            {mlOutput.rul.healthIndex < 50 && (
              <button
                onClick={handleCreateWorkOrder}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/30"
              >
                <Wrench size={13} />
                <span>Créer OT Direct</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
