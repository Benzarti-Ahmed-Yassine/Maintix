import React, { useState } from 'react';
import { Play, AlertTriangle, ShieldCheck, Flame, Radio, Activity } from 'lucide-react';
import { useAppStore } from '../store/useStore.js';
import axios from 'axios';

export const DemoSwitcherBar: React.FC = () => {
  const { activeScenario, setActiveScenario, updateLiveTelemetry } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleTrigger = async (scenario: string) => {
    setActiveScenario(scenario);
    setLoading(true);

    try {
      const res = await axios.post('/api/admin/demo-scenario', { scenario });
      if (res.data.telemetry) {
        updateLiveTelemetry({
          machineCode: 'TX-1250-A',
          timestamp: new Date().toISOString(),
          vibRMS: res.data.telemetry.vibRMS,
          tempBearing: res.data.telemetry.tempBearing,
          tempMotor: 48.5,
          current: 4.2,
          speedRpm: 1450,
          healthIndex: res.data.machine.healthScore,
          anomalyScore: res.data.machine.anomalyScore,
          isAnomaly: res.data.machine.anomalyScore > 0.45,
          severity: res.data.machine.status,
          estimatedRulDays: res.data.machine.predictedRulDays
        });
      }
    } catch (err) {
      console.warn('Demo scenario fallback triggered');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/80 rounded-full px-4 py-2 shadow-2xl z-40 flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 pr-2 border-r border-slate-700">
        <Activity size={14} className="text-blue-400 animate-pulse" />
        <span>JURY DEMO CONTROL:</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleTrigger('NORMAL')}
          className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 transition ${
            activeScenario === 'NORMAL'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck size={12} /> Normal
        </button>

        <button
          onClick={() => handleTrigger('BEARING_FAILURE')}
          className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 transition ${
            activeScenario === 'BEARING_FAILURE'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse'
              : 'bg-slate-800 text-red-400 hover:bg-slate-700'
          }`}
        >
          <AlertTriangle size={12} /> Bearing Failure ⚠️
        </button>

        <button
          onClick={() => handleTrigger('OVERHEATING')}
          className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 transition ${
            activeScenario === 'OVERHEATING'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
          }`}
        >
          <Flame size={12} /> Overheating
        </button>

        <button
          onClick={() => handleTrigger('CRITICAL')}
          className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 transition ${
            activeScenario === 'CRITICAL'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-800 text-purple-400 hover:bg-slate-700'
          }`}
        >
          <Radio size={12} /> Critical Alert
        </button>
      </div>

      {loading && <span className="text-[10px] text-blue-400 font-mono animate-pulse">updating...</span>}
    </div>
  );
};
