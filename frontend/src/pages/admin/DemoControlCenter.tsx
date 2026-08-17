import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Trash2,
  Database,
  Cpu,
  Layers,
  FileText,
  Radio,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Power,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Terminal
} from 'lucide-react';
import {
  useDemoStatus,
  useDemoScenarios,
  useTriggerScenario,
  useResetDemo,
  useSeedDemo
} from '../../hooks/useAdminData.js';
import { useAppStore } from '../../store/useStore.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const DemoControlCenter: React.FC = () => {
  const { setSelectedMachineCode } = useAppStore();
  const { data: status, isLoading, isError, error, refetch } = useDemoStatus();
  const { data: scenarios = [] } = useDemoScenarios();
  const triggerScenarioMutation = useTriggerScenario();
  const resetDemoMutation = useResetDemo();
  const seedDemoMutation = useSeedDemo();

  const [selectedMachine, setSelectedMachine] = useState('TX-1250-A');
  const [lastActionMsg, setLastActionMsg] = useState<string | null>(null);

  const handleScenarioClick = (scenarioId: string) => {
    setLastActionMsg(`Injecting scenario '${scenarioId}' on ${selectedMachine}...`);
    triggerScenarioMutation.mutate(
      { scenario: scenarioId, machineCode: selectedMachine },
      {
        onSuccess: (data: any) => {
          setLastActionMsg(`✅ ${data.message || `Scenario ${scenarioId} injected successfully!`}`);
          refetch();
        },
        onError: (err: any) => {
          setLastActionMsg(`❌ Scenario injection failed: ${err.message}`);
        }
      }
    );
  };

  const handleReset = () => {
    if (!window.confirm('Reset simulated demo data? All simulated telemetry and alarms will be removed, and machines restored to healthy baseline.')) {
      return;
    }
    setLastActionMsg('Resetting simulated demo environment...');
    resetDemoMutation.mutate(undefined, {
      onSuccess: (data: any) => {
        setLastActionMsg(`✅ ${data.message || 'Demo data reset complete.'}`);
        refetch();
      },
      onError: (err: any) => {
        setLastActionMsg(`❌ Reset failed: ${err.message}`);
      }
    });
  };

  const handleSeed = (scope: string) => {
    setLastActionMsg(`Seeding demo factory (${scope})...`);
    seedDemoMutation.mutate(scope, {
      onSuccess: (data: any) => {
        setLastActionMsg(`✅ ${data.message}`);
        refetch();
      },
      onError: (err: any) => {
        setLastActionMsg(`❌ Seed failed: ${err.message}`);
      }
    });
  };

  const scenarioIcons: Record<string, any> = {
    NORMAL_OPERATION: ShieldCheck,
    BEARING_DEGRADATION: Activity,
    MOTOR_OVERHEATING: Flame,
    GEARBOX_FAILURE: AlertTriangle,
    VIBRATION_ANOMALY: Activity,
    OVERCURRENT: Zap,
    SENSOR_FAILURE: Radio,
    MACHINE_FAILURE: Power,
    MAINTENANCE_RECOVERY: CheckCircle2
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal size={22} className="text-blue-400" /> Demo Data Control Center & Simulator
          </h1>
          <p className="text-xs text-slate-400">
            Admin World Control: inject telemetry scenarios through real backend pathways (MQTT/DB → AI → WebSocket → Operational Roles)
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          title="Refresh Demo Status"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {lastActionMsg && (
        <div className="p-3 bg-blue-950/80 border border-blue-800 rounded-lg text-xs font-mono text-blue-300 flex items-center justify-between">
          <span>{lastActionMsg}</span>
          <button onClick={() => setLastActionMsg(null)} className="text-slate-400 hover:text-white ml-4">✕</button>
        </div>
      )}

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
      >
        {/* 1. Demo Environment Status Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={15} className="text-blue-400" /> Demo Environment Status
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              ● Simulation Engine Online
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="industrial-card p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Machines</p>
              <p className="text-xl font-black text-white font-mono">{status?.machines || 0}</p>
            </div>
            <div className="industrial-card p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Sensors</p>
              <p className="text-xl font-black text-white font-mono">{status?.sensors || 0}</p>
            </div>
            <div className="industrial-card p-3 text-center border-red-900/60">
              <p className="text-[10px] font-semibold text-red-400 uppercase">Alerts</p>
              <p className="text-xl font-black text-red-400 font-mono">{status?.activeAlerts || 0}</p>
            </div>
            <div className="industrial-card p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Interventions</p>
              <p className="text-xl font-black text-white font-mono">{status?.workOrders || 0}</p>
            </div>
            <div className="industrial-card p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Telemetry</p>
              <p className="text-xl font-black text-emerald-400 font-mono">{status?.simulatedTelemetryRecords || 0}</p>
            </div>
            <div className="industrial-card p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">ERP Records</p>
              <p className="text-xl font-black text-white font-mono">{status?.erpRecords || 0}</p>
            </div>
            <div className="industrial-card p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">MES Records</p>
              <p className="text-xl font-black text-white font-mono">{status?.mesRecords || 0}</p>
            </div>
            <div className="industrial-card p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Documents</p>
              <p className="text-xl font-black text-white font-mono">{status?.documents || 0}</p>
            </div>
          </div>
        </div>

        {/* 2. Admin Actions Control Bar */}
        <div className="industrial-card p-5 space-y-3 border-blue-900/40">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio size={16} className="text-blue-400" /> Factory Seeding & Environment Reset Actions
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleSeed('FACTORY')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow flex items-center gap-1.5"
            >
              <Database size={14} /> SEED FACTORY
            </button>
            <button
              onClick={() => handleSeed('MACHINES')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              SEED MACHINES
            </button>
            <button
              onClick={() => handleSeed('MAINTENANCE')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              SEED MAINTENANCE
            </button>
            <button
              onClick={() => handleSeed('PRODUCTION')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              SEED PRODUCTION
            </button>
            <button
              onClick={() => handleSeed('ERP')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              SEED ERP
            </button>
            <button
              onClick={() => handleSeed('MES')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              SEED MES
            </button>
            <button
              onClick={() => handleSeed('RAG')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              SEED RAG
            </button>
            <button
              onClick={() => handleScenarioClick('NORMAL_OPERATION')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow flex items-center gap-1.5"
            >
              <ShieldCheck size={14} /> RUN FULL DEMO (NOMINAL)
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 font-bold rounded-lg border border-red-800 transition flex items-center gap-1.5 ml-auto"
            >
              <RotateCcw size={14} /> RESET DEMO DATA
            </button>
          </div>
        </div>

        {/* 3. Demo Scenario Injection Matrix */}
        <div className="industrial-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Play size={16} className="text-amber-400" /> Anomaly & Telemetry Scenarios Injector
              </h2>
              <p className="text-xs text-slate-400">
                Click any scenario to inject physical sensor parameters into backend MQTT/DB. Telemetry flows to all 4 role dashboards in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-semibold">Target Machine:</label>
              <select
                value={selectedMachine}
                onChange={(e) => {
                  setSelectedMachine(e.target.value);
                  setSelectedMachineCode(e.target.value);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                <option value="TX-1250-A">TX-1250-A (Air-Jet Loom A12)</option>
                <option value="TX-0672-B">TX-0672-B (Ring Spinning B06)</option>
                <option value="TX-0981-C">TX-0981-C (Rapier Loom C09)</option>
                <option value="TX-1123-D">TX-1123-D (Stenter Frame D11)</option>
                <option value="TX-0777-E">TX-0777-E (Warp Winder E07)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((sc: any) => {
              const Icon = scenarioIcons[sc.id] || Activity;
              const isCritical = sc.severity === 'CRITICAL';
              const isHigh = sc.severity === 'HIGH';
              const isLow = sc.severity === 'LOW';

              return (
                <div
                  key={sc.id}
                  onClick={() => handleScenarioClick(sc.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                    isCritical
                      ? 'bg-red-950/30 border-red-900/60 hover:border-red-500 hover:bg-red-950/60'
                      : isHigh
                      ? 'bg-amber-950/30 border-amber-900/60 hover:border-amber-500 hover:bg-amber-950/60'
                      : isLow
                      ? 'bg-emerald-950/30 border-emerald-900/60 hover:border-emerald-500 hover:bg-emerald-950/60'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        isCritical ? 'bg-red-600/20 text-red-400' : isHigh ? 'bg-amber-600/20 text-amber-400' : 'bg-emerald-600/20 text-emerald-400'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-white">{sc.label}</h3>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          isCritical ? 'bg-red-950 text-red-400' : isHigh ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {sc.severity}
                        </span>
                      </div>
                    </div>

                    <button
                      className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                      title="Trigger"
                    >
                      <Play size={12} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{sc.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Real Industrial Architecture Pipeline Flow Visualizer */}
        <div className="industrial-card p-5 space-y-3 border-slate-800 bg-slate-950/60">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Terminal size={15} className="text-blue-400" /> Architectural Data Pipeline Trace
          </h2>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5">
            <p className="text-blue-400 font-bold">● Admin Trigger → Demo Engine → MQTT/DB (sourceType: SIMULATED)</p>
            <p className="text-emerald-400">↳ Machine State & Telemetry Ingested → Anomaly Detection (AutoEncoder/LightGBM)</p>
            <p className="text-amber-400">↳ Alarms & AI Recommendations Generated → WebSocket Broadcast</p>
            <p className="text-purple-400">↳ TanStack Query Cache Invalidated → 4 Operational Role Dashboards Synchronized</p>
          </div>
        </div>
      </QueryStateWrapper>
    </div>
  );
};
