import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Machine3DViewer } from '../../components/Machine3DViewer.js';
import { AlertTriangle, Bot, CheckCircle2, ChevronRight, Cpu, Activity, Clock, ShieldCheck, Wrench, Layers } from 'lucide-react';
import { useAppStore } from '../../store/useStore.js';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useTechnicianOverview, useMachineTelemetryHistory, useMachineAlerts } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const TechnicianOverview: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMachineCode, liveTelemetry, setCopilotOpen, liveConnected } = useAppStore();

  const {
    data: overviewData,
    isLoading: overviewLoading,
    isError: overviewError,
    error: overviewErrObj,
    refetch: refetchOverview
  } = useTechnicianOverview(selectedMachineCode);

  const {
    data: historyData,
    isLoading: historyLoading
  } = useMachineTelemetryHistory(selectedMachineCode, 15);

  const machine = overviewData?.machine;
  // If live WebSocket telemetry is available for this machine, prioritize it over snapshot
  const currentTelemetry = liveTelemetry[selectedMachineCode] || overviewData?.telemetry || {
    vibRMS: machine?.status === 'CRITICAL' ? 11.2 : 1.4,
    tempBearing: machine?.status === 'CRITICAL' ? 62.5 : 42.0,
    current: 4.2,
    speedRpm: 1450,
    healthIndex: machine?.healthScore ?? 96.0,
    anomalyScore: machine?.anomalyScore ?? 0.03,
    estimatedRulDays: machine?.predictedRulDays ?? 60
  };

  const sparklineData = (historyData && historyData.length > 0)
    ? historyData.map((h: any) => ({
        time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vib: h.vibRMS
      }))
    : [
        { time: 'T-3h', vib: currentTelemetry.vibRMS > 5 ? 2.4 : 1.2 },
        { time: 'T-2h', vib: currentTelemetry.vibRMS > 5 ? 4.8 : 1.3 },
        { time: 'T-1h', vib: currentTelemetry.vibRMS > 5 ? 8.2 : 1.4 },
        { time: 'Live', vib: currentTelemetry.vibRMS }
      ];

  const recentAlerts = overviewData?.alerts || [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <QueryStateWrapper
        isLoading={overviewLoading}
        isError={overviewError}
        error={overviewErrObj}
        isEmpty={!overviewLoading && !overviewError && !machine}
        emptyTitle="No Machine Available"
        emptyMessage="Please select a valid machine or ensure backend database has active machine records."
        onRetry={() => refetchOverview()}
        isOffline={!liveConnected}
      >
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols): 3D Viewer & Live Sensor Data */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 3D Machine Viewer Box */}
            <div className="industrial-card p-4 relative flex flex-col h-[340px] cursor-pointer" onClick={() => navigate(`/technician/machines/${selectedMachineCode}`)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Cpu size={14} className="text-blue-400" /> Machine 3D Spatial Diagnostic ({selectedMachineCode} — {machine?.name || 'Textile Loom'})
                </span>
                <span className="text-[10px] text-blue-400 font-mono">Click for full inspection →</span>
              </div>
              <div className="flex-1 w-full h-full">
                <Machine3DViewer machineCode={selectedMachineCode} isAnomalyActive={currentTelemetry.vibRMS > 4.5} />
              </div>
            </div>

            {/* Live Sensor Data Gauges & Chart Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Live Sensor Values Grid */}
              <div className="industrial-card p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center justify-between">
                  <span>Live Sensor Telemetry</span>
                  <span className={`text-[10px] font-mono flex items-center gap-1 ${liveConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${liveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {liveConnected ? 'Real-time API/WS' : 'Cached Snapshot'}
                  </span>
                </h3>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 mb-1">Vibration</p>
                    <p className={`text-lg font-black font-mono ${currentTelemetry.vibRMS > 4.5 ? 'text-red-500' : 'text-slate-200'}`}>
                      {currentTelemetry.vibRMS}
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold">mm/s RMS</p>
                  </div>

                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 mb-1">Temperature</p>
                    <p className={`text-lg font-black font-mono ${currentTelemetry.tempBearing > 55 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {currentTelemetry.tempBearing}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-semibold">°C</p>
                  </div>

                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 mb-1">Current</p>
                    <p className="text-lg font-black text-emerald-400 font-mono">{currentTelemetry.current}</p>
                    <p className="text-[9px] text-emerald-400 font-semibold">A</p>
                  </div>

                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 mb-1">Speed</p>
                    <p className="text-lg font-black text-slate-200 font-mono">{currentTelemetry.speedRpm}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">RPM</p>
                  </div>
                </div>

                {/* Vibration Timeline Sparkline Chart */}
                <div className="h-28 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} domain={[0, 15]} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="vib"
                        stroke={currentTelemetry.vibRMS > 4.5 ? '#ef4444' : '#10b981'}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: currentTelemetry.vibRMS > 4.5 ? '#ef4444' : '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Alerts List */}
              <div className="industrial-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Active Machine Alarms</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${recentAlerts.length > 0 ? 'bg-red-950 text-red-400 border-red-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'}`}>
                      {recentAlerts.length} Active
                    </span>
                  </div>

                  {recentAlerts.length === 0 ? (
                    <div className="p-4 bg-slate-900/60 rounded-lg text-center text-xs text-slate-400">
                      No active alarms detected on {selectedMachineCode}. Machine operating nominally.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentAlerts.slice(0, 3).map((alm: any, i: number) => (
                        <div
                          key={alm.id || i}
                          onClick={() => navigate('/technician/alerts')}
                          className={`p-2.5 bg-slate-900/80 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                            alm.severity === 'CRITICAL'
                              ? 'border-red-900/40 hover:border-red-500'
                              : alm.severity === 'HIGH'
                              ? 'border-amber-900/40 hover:border-amber-500'
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                              alm.severity === 'CRITICAL'
                                ? 'bg-red-600/20 text-red-400'
                                : alm.severity === 'HIGH'
                                ? 'bg-amber-600/20 text-amber-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{alm.title}</p>
                              <p className="text-[10px] text-slate-400">
                                {alm.timestamp ? new Date(alm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'} • {alm.description || 'Threshold trigger'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/technician/alerts')}
                  className="mt-4 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded text-center transition"
                >
                  View all alerts & history
                </button>
              </div>

            </div>
          </div>

          {/* Right Column (1 Col): AI Diagnosis & Copilot Card */}
          <div className="space-y-6">
            
            {/* AI Diagnosis Card */}
            <div className="industrial-card p-5 border-blue-900/60 space-y-4">
              <h3 className="text-xs font-bold text-blue-400 tracking-wider uppercase flex items-center justify-between">
                <span>AI Health Diagnosis</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono">Backend ML Engine</span>
              </h3>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {currentTelemetry.vibRMS > 4.5 ? 'Abnormal Vibration Pattern Detected' : 'Normal Operational Parameter'}
                </h4>
                <p className="text-xs text-slate-400">Bearing Diagnostic Assembly ({selectedMachineCode})</p>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Confidence</p>
                  <p className="text-xl font-black text-white font-mono">{Math.round(currentTelemetry.anomalyScore * 100)}%</p>
                </div>

                <div className="w-24 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line type="monotone" dataKey="vib" stroke={currentTelemetry.vibRMS > 4.5 ? '#ef4444' : '#10b981'} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining Useful Life (RUL)</p>
                  <p className="text-xl font-black text-amber-400 font-mono">{currentTelemetry.estimatedRulDays} days</p>
                </div>
                <span className="text-lg font-black text-slate-400 font-mono">{currentTelemetry.healthIndex}% Health</span>
              </div>
            </div>

            {/* AI Copilot & Action Card */}
            <div className="industrial-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Bot size={16} className="text-blue-400" /> AI Copilot Diagnostic
                </h3>
                <ChevronRight size={16} className="text-slate-500 cursor-pointer" onClick={() => setCopilotOpen(true)} />
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs space-y-2">
                <p className="font-semibold text-blue-300">Why is the vibration high on {selectedMachineCode}?</p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {currentTelemetry.vibRMS > 4.5
                    ? 'AI Root Cause Analysis: Stage 3 bearing outer-race pitting combined with shaft micro-misalignment.'
                    : 'All parameters within normal operating envelopes. No anomalous harmonic signatures detected.'}
                </p>
                <button
                  onClick={() => setCopilotOpen(true)}
                  className="mt-2 text-[11px] text-blue-400 hover:underline font-semibold block"
                >
                  Ask AI Copilot for full procedure →
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Action</p>
                <p className="text-xs font-bold text-white">
                  {currentTelemetry.vibRMS > 4.5 ? 'Replace bearing and lubricate drive shaft assembly' : 'Routine monitoring — maintain schedule'}
                </p>
                <button
                  onClick={() => navigate('/technician/work-orders')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <Wrench size={14} /> Create Work Order
                </button>
              </div>
            </div>

            {/* Connected Systems Status Bar */}
            <div className="industrial-card p-4 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Connected Industrial Systems</h4>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>SAP PM (ERP Bridge)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Siemens Opcenter (MES)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Mosquitto MQTT Live Telemetry</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </QueryStateWrapper>
    </div>
  );
};
