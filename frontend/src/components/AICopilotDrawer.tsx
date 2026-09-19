import React, { useState } from 'react';
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
  Zap,
  Package,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../store/useStore.js';
import { useHistoryStore } from '../store/useHistoryStore.js';
import {
  queryAiCopilot,
  executeProductActionApi,
  TelemetryInputs,
  ExtractedProblemData,
} from '../api/mlInference.js';
import { apiClient } from '../api/apiClient.js';

interface Message {
  sender: 'USER' | 'AI';
  text: string;
  confidence?: number;
  sources?: { title: string; snippet: string }[];
  actions?: string[];
  evidence?: string[];
  activeAiEngine?: string;
  extractedProblem?: ExtractedProblemData;
  productActions?: any[];
  feedbackSent?: boolean;
  executedActions?: Record<string, boolean>;
  timestamp?: string;
}

export const AICopilotDrawer: React.FC = () => {
  const {
    activeRole,
    selectedMachineCode,
    isCopilotOpen,
    setCopilotOpen,
    triggerRefresh,
    liveTelemetry,
    liveConnected
  } = useAppStore();
  const { addAction } = useHistoryStore();

  // Chat State
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [woSuccessMsg, setWoSuccessMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  // Live Machine Telemetry directly from production data
  const currentTelemetry = liveTelemetry[selectedMachineCode] || {
    vibRMS: 1.4,
    tempBearing: 42.0,
    tempMotor: 45.0,
    current: 4.2,
    speedRpm: 1450,
    healthIndex: 96.0,
    anomalyScore: 0.03,
    estimatedRulDays: 60
  };

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

    const productionInputs: TelemetryInputs = {
      machineCode: selectedMachineCode || 'TX-1250-A',
      vibRms: Number(currentTelemetry.vibRMS) || 1.4,
      vibPeak: Number(currentTelemetry.vibRMS ? currentTelemetry.vibRMS * 1.35 : 2.1),
      tempBearing: Number(currentTelemetry.tempBearing) || 42.0,
      tempMotor: Number(currentTelemetry.tempMotor) || 45.0,
      current: Number(currentTelemetry.current) || 4.2,
      voltage: 400.0,
      speedRpm: Number(currentTelemetry.speedRpm) || 1450.0
    };

    try {
      const response = await queryAiCopilot(
        textToSend,
        activeRole || 'TECHNICIAN',
        selectedMachineCode,
        productionInputs
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
          activeAiEngine: response.activeAiEngine,
          extractedProblem: response.extractedProblem,
          productActions: response.productActions,
          executedActions: {},
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (msgIdx: number, actionId: string, payload: any) => {
    setExecutingActionId(`${msgIdx}-${actionId}`);
    try {
      const result = await executeProductActionApi(
        actionId,
        payload,
        activeRole || 'TECHNICIAN',
        activeRole === 'INDUSTRIAL_DIRECTOR' ? 'Dr. Yassine Benzarti' : 'Opérateur Maintix'
      );

      // Record in history audit store
      addAction({
        role: activeRole || 'TECHNICIAN',
        userName: activeRole === 'INDUSTRIAL_DIRECTOR' ? 'Dr. Yassine Benzarti' : 'Opérateur Maintix',
        action: actionId === 'CREATE_WORK_ORDER' ? 'ORDRE_TRAVAIL_IA_GENERE' : actionId === 'RESERVE_SPARE_PART' ? 'PIECE_RESERVEE_STOCK' : 'CONSIGNE_AUTOMATE_APPLIQUEE',
        category: actionId === 'THROTTLE_MACHINE' ? 'PRODUCTION' : 'MAINTENANCE',
        details: result.message,
        machineCode: payload.machine_code || selectedMachineCode,
        status: actionId === 'THROTTLE_MACHINE' ? 'WARNING' : 'SUCCESS'
      });

      triggerRefresh();

      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === msgIdx
            ? {
                ...m,
                executedActions: { ...(m.executedActions || {}), [actionId]: true }
              }
            : m
        )
      );

      setWoSuccessMsg(`✅ ${result.message}`);
      setTimeout(() => setWoSuccessMsg(null), 4500);
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleCreateWorkOrder = async () => {
    try {
      await apiClient.post('/api/maintenance/work-orders', {
        machineId: selectedMachineCode,
        title: `Intervention IA : Dégradation détectée sur ${selectedMachineCode}`,
        description: `Ordre généré par le Copilote IA. Vibration: ${currentTelemetry.vibRMS} mm/s RMS. Température: ${currentTelemetry.tempBearing}°C.`,
        priority: currentTelemetry.vibRMS > 4.5 ? 'URGENT' : 'HIGH'
      });
    } catch (e) {
      // ignore
    }

    addAction({
      role: activeRole || 'TECHNICIAN',
      userName: activeRole === 'INDUSTRIAL_DIRECTOR' ? 'Dr. Yassine Benzarti' : 'Opérateur Maintix',
      action: 'ORDRE_TRAVAIL_ML_GENERE',
      category: 'MAINTENANCE',
      details: `Création Ordre de Travail généré par IA pour ${selectedMachineCode}`,
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
      details: `Feedback sur inférence RAG : ${rating === 'HELPFUL' ? 'Validé (+1)' : 'Rejeté (-1)'}`,
      machineCode: selectedMachineCode,
      status: rating === 'HELPFUL' ? 'SUCCESS' : 'WARNING'
    });

    setMessages((prev) =>
      prev.map((m, idx) => (idx === msgIdx ? { ...m, feedbackSent: true } : m))
    );
  };

  const currentSuggestions = roleSuggestions[activeRole || 'TECHNICIAN'] || roleSuggestions.TECHNICIAN;

  if (!isCopilotOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[460px] max-w-full bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 font-mono">
                Copilote IA & RAG
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
                {activeRole || 'TECHNICIAN'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cible : <span className="text-emerald-600 font-mono font-bold">{selectedMachineCode}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setCopilotOpen(false)}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          title="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Production Live Telemetry Banner */}
      <div className="px-3.5 py-2.5 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <div>
            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
              <span>MODE PRODUCTION</span>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">
                {liveConnected ? '● TÉLÉMÉTRIE LIVE' : '○ STATIQUE'}
              </span>
            </span>
          </div>
        </div>

        {/* Real-time Telemetry Snapshot Badge */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 font-bold text-slate-700 shadow-sm">
            {currentTelemetry.vibRMS} mm/s
          </span>
          <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 font-bold text-slate-700 shadow-sm">
            {currentTelemetry.tempBearing}°C
          </span>
        </div>
      </div>

      {woSuccessMsg && (
        <div className="bg-emerald-100 border-b border-emerald-200 p-2.5 text-xs text-emerald-800 text-center font-bold flex items-center justify-center gap-2">
          <CheckCircle2 size={14} />
          <span>{woSuccessMsg}</span>
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles size={11} className="text-emerald-600" />
          Requêtes Rapides Production :
        </p>
        <div className="flex flex-col gap-1.5">
          {currentSuggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sug)}
              className="text-left text-[11px] text-slate-700 hover:text-emerald-900 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-lg px-2.5 py-1.5 transition truncate flex items-center justify-between group shadow-sm"
            >
              <span className="truncate">{sug}</span>
              <ChevronRight size={12} className="text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200 mt-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <Bot size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Prêt pour l'inférence</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Posez une question technique, demandez un diagnostic en direct ou interrogez les manuels industriels indexés.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                msg.sender === 'USER'
                  ? 'bg-emerald-600 border-emerald-700 text-white ml-6 shadow-md'
                  : 'bg-white border-slate-200 text-slate-800 mr-2 shadow-sm'
              }`}
            >
              {msg.sender === 'AI' && (
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Cpu size={13} /> {msg.activeAiEngine || 'Inférence Modèle & RAG'}
                  </span>
                  {msg.confidence && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-200">
                      Confiance : {Math.round(msg.confidence * 100)}%
                    </span>
                  )}
                </div>
              )}

              <p className={`whitespace-pre-line font-normal ${msg.sender === 'USER' ? 'text-white' : 'text-slate-800'}`}>{msg.text}</p>

              {/* EXTRACTED PROBLEM & PRODUCT SYSTEM INTEGRATION CARD */}
              {msg.extractedProblem && (
                <div className={`mt-3.5 p-3 rounded-xl border transition-all ${
                  msg.extractedProblem.severity === 'CRITICAL'
                    ? 'bg-red-50 border-red-200 shadow-sm'
                    : msg.extractedProblem.severity === 'HIGH'
                    ? 'bg-amber-50 border-amber-200 shadow-sm'
                    : 'bg-emerald-50 border-emerald-200 shadow-sm'
                }`}>
                  {/* Problem Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-white text-emerald-700 rounded font-mono font-bold text-[10px] border border-slate-200">
                        {msg.extractedProblem.machine_code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                        msg.extractedProblem.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : msg.extractedProblem.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {msg.extractedProblem.severity} ({msg.extractedProblem.iso_zone})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      RUL : <strong className="text-slate-900">{msg.extractedProblem.rul_days}j</strong>
                    </span>
                  </div>

                  {/* Subsystem & Urgency */}
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">Composant défaillant :</span>
                      <span className="font-bold text-slate-900 text-right">{msg.extractedProblem.subsystem}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-600">Urgence d'intervention :</span>
                      <span className="font-bold text-amber-700">{msg.extractedProblem.urgency}</span>
                    </div>
                  </div>

                  {/* Extracted Symptoms */}
                  {msg.extractedProblem.symptoms && msg.extractedProblem.symptoms.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                        <AlertTriangle size={11} className="text-amber-500" />
                        Symptômes physiques extraits :
                      </p>
                      <ul className="text-[10px] text-slate-700 space-y-0.5">
                        {msg.extractedProblem.symptoms.map((sym, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1">
                            <span className="text-emerald-600">•</span>
                            <span>{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Spare Part Box */}
                  {msg.extractedProblem.required_spare_part && (
                    <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-slate-200 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                          <Package size={12} className="text-emerald-600" />
                          Pièce Magasin Requise
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono font-bold">
                          Stock : {msg.extractedProblem.required_spare_part.stock_available} en stock
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-900">
                        {msg.extractedProblem.required_spare_part.name}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Réf : <span className="font-mono text-slate-800 font-bold">{msg.extractedProblem.required_spare_part.part_number}</span> • Emplacement : <span className="text-emerald-700 font-bold">{msg.extractedProblem.required_spare_part.location}</span>
                      </p>
                      {msg.extractedProblem.required_spare_part.lubricant && (
                        <p className="text-[9px] text-slate-500">
                          Lubrifiant : <span className="text-slate-700">{msg.extractedProblem.required_spare_part.lubricant}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Avoided Loss & Downtime */}
                  <div className="mt-2 flex items-center justify-between text-[10px] pt-1 border-t border-slate-200 font-mono">
                    <span className="text-slate-600">Pertes évitées estimées :</span>
                    <span className="text-emerald-700 font-bold">+{msg.extractedProblem.avoided_loss_usd.toLocaleString()} $</span>
                  </div>

                  {/* ACTIONABLE PRODUCT SYSTEM BUTTONS */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                      <Zap size={11} className="text-amber-500" />
                      Actions directes système produit :
                    </p>

                    {/* Action 1: Create Work Order */}
                    <button
                      onClick={() => handleExecuteAction(idx, 'CREATE_WORK_ORDER', msg.extractedProblem!.work_order_draft)}
                      disabled={msg.executedActions?.['CREATE_WORK_ORDER'] || executingActionId === `${idx}-CREATE_WORK_ORDER`}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-md ${
                        msg.executedActions?.['CREATE_WORK_ORDER']
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {executingActionId === `${idx}-CREATE_WORK_ORDER` ? (
                        <Loader2 size={14} className="animate-spin text-white" />
                      ) : msg.executedActions?.['CREATE_WORK_ORDER'] ? (
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      ) : (
                        <Wrench size={14} />
                      )}
                      <span>
                        {msg.executedActions?.['CREATE_WORK_ORDER']
                          ? 'Ordre de Travail GMAO Créé & Assigné'
                          : 'Créer & Assigner Ordre de Travail'}
                      </span>
                    </button>

                    {/* Action 2: Reserve Spare Part */}
                    {msg.extractedProblem.required_spare_part && (
                      <button
                        onClick={() => handleExecuteAction(idx, 'RESERVE_SPARE_PART', msg.extractedProblem!.required_spare_part)}
                        disabled={msg.executedActions?.['RESERVE_SPARE_PART'] || executingActionId === `${idx}-RESERVE_SPARE_PART`}
                        className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-2 border ${
                          msg.executedActions?.['RESERVE_SPARE_PART']
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
                        }`}
                      >
                        {executingActionId === `${idx}-RESERVE_SPARE_PART` ? (
                          <Loader2 size={13} className="animate-spin text-emerald-600" />
                        ) : msg.executedActions?.['RESERVE_SPARE_PART'] ? (
                          <CheckCircle2 size={13} className="text-emerald-600" />
                        ) : (
                          <Package size={13} className="text-emerald-600" />
                        )}
                        <span>
                          {msg.executedActions?.['RESERVE_SPARE_PART']
                            ? 'Pièce Réservée en Stock'
                            : `Réserver Pièce (${msg.extractedProblem.required_spare_part.name.slice(0, 20)}...)`}
                        </span>
                      </button>
                    )}

                    {/* Action 3: Machine Throttle / PLC Control */}
                    {msg.extractedProblem.severity === 'CRITICAL' && (
                      <button
                        onClick={() => handleExecuteAction(idx, 'THROTTLE_MACHINE', {
                          machine_code: msg.extractedProblem!.machine_code,
                          target_speed_rpm: 1250,
                          reason: `Protection mécanique ${msg.extractedProblem!.subsystem}`
                        })}
                        disabled={msg.executedActions?.['THROTTLE_MACHINE'] || executingActionId === `${idx}-THROTTLE_MACHINE`}
                        className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-2 border ${
                          msg.executedActions?.['THROTTLE_MACHINE']
                            ? 'bg-amber-100 text-amber-900 border-amber-300 cursor-default'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200 shadow-sm'
                        }`}
                      >
                        {executingActionId === `${idx}-THROTTLE_MACHINE` ? (
                          <Loader2 size={13} className="animate-spin text-amber-600" />
                        ) : msg.executedActions?.['THROTTLE_MACHINE'] ? (
                          <CheckCircle2 size={13} className="text-amber-600" />
                        ) : (
                          <Zap size={13} className="text-amber-600" />
                        )}
                        <span>
                          {msg.executedActions?.['THROTTLE_MACHINE']
                            ? 'Consigne Automate Appliquée (-15% Cadence)'
                            : 'Appliquer Consigne Automate (-15% Cadence)'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {msg.evidence && msg.evidence.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldAlert size={12} className="text-amber-500" />
                    Signaux physiques dominants :
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                    {msg.evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                    <FileText size={12} className="text-emerald-600" />
                    Sources documentaires RAG :
                  </div>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="text-[11px] bg-slate-50 border border-slate-200 p-2 rounded-lg mb-1 text-slate-700 shadow-sm">
                      <span className="font-bold text-emerald-700">{s.title} :</span> {s.snippet}
                    </div>
                  ))}
                </div>
              )}

              {msg.actions && msg.actions.length > 0 && !msg.extractedProblem && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                    Actions recommandées :
                  </div>
                  <div className="space-y-1.5">
                    {msg.actions.map((act, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>

                  {activeRole === 'TECHNICIAN' && (
                    <button
                      onClick={handleCreateWorkOrder}
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <Wrench size={14} />
                      <span>Créer l'Ordre de Travail</span>
                    </button>
                  )}
                </div>
              )}

              {msg.sender === 'AI' && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {msg.timestamp || 'Temps réel'}
                  </span>

                  {msg.feedbackSent ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Feedback validé
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Précision ?</span>
                      <button
                        onClick={() => handleFeedback(idx, 'HELPFUL')}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition"
                        title="Pertinent"
                      >
                        <ThumbsUp size={13} />
                      </button>
                      <button
                        onClick={() => handleFeedback(idx, 'NOT_HELPFUL')}
                        className="p-1 text-slate-400 hover:text-red-500 transition"
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
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 animate-pulse flex items-center gap-3">
            <Cpu size={18} className="animate-spin text-emerald-600" />
            <div>
              <p className="font-bold text-slate-900">Inférence ML en cours...</p>
              <p className="text-[10px] text-slate-600">Calcul du score RUL & extraction RAG</p>
            </div>
          </div>
        )}
      </div>

      {/* Query Input */}
      <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Poser une question technique ou demander un diagnostic..."
          className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={!query.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
