import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Machine3DViewer } from '../../components/Machine3DViewer.js';
import { ArrowLeft, Cpu, Bot, Wrench, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useStore.js';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useMachine, useMachineTelemetryHistory } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const MachineInspectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const machineCode = id || 'TX-1250-A';
  const navigate = useNavigate();
  const { liveTelemetry, setCopilotOpen } = useAppStore();

  const {
    data: machineData,
    isLoading: machineLoading,
    isError: machineError,
    error: machineErr,
    refetch: refetchMachine
  } = useMachine(machineCode);

  const {
    data: historyData = [],
    isLoading: historyLoading,
    refetch: refetchHistory
  } = useMachineTelemetryHistory(machineCode, 15);

  const [selectedComp, setSelectedComp] = useState('Main Shaft Bearing (Left)');

  const telemetry = liveTelemetry[machineCode] || {
    vibRMS: machineData?.status === 'CRITICAL' ? 11.2 : 1.4,
    tempBearing: machineData?.status === 'CRITICAL' ? 62.5 : 42.0,
    current: 4.2,
    speedRpm: 1450,
    healthIndex: machineData?.healthScore ?? 96.0,
    anomalyScore: machineData?.anomalyScore ?? 0.03,
    estimatedRulDays: machineData?.predictedRulDays ?? 60
  };

  const telemetryHistory = historyData.length > 0
    ? historyData.map((h: any) => ({
        time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vib: h.vibRMS,
        temp: h.tempBearing
      }))
    : [
        { time: 'T-3h', vib: telemetry.vibRMS > 5 ? 2.4 : 1.2, temp: 42 },
        { time: 'T-2h', vib: telemetry.vibRMS > 5 ? 4.8 : 1.3, temp: 45 },
        { time: 'T-1h', vib: telemetry.vibRMS > 5 ? 8.2 : 1.4, temp: 52 },
        { time: 'Live', vib: telemetry.vibRMS, temp: telemetry.tempBearing }
      ];

  const components = machineData?.components || [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Deep Machine Diagnostic Inspection: <span className="font-mono text-blue-400">{machineCode}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {machineData?.name || 'Textile Machine Diagnostic'} • {machineData?.manufacturer} {machineData?.model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { refetchMachine(); refetchHistory(); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh Machine Diagnostic"
          >
            <RefreshCw size={16} className={machineLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCopilotOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow"
          >
            <Bot size={14} /> Diagnose with AI Copilot
          </button>
          <button
            onClick={() => navigate('/technician/work-orders')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow"
          >
            <Wrench size={14} /> Create Work Order
          </button>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={machineLoading}
        isError={machineError}
        error={machineErr}
        isEmpty={!machineLoading && !machineError && !machineData}
        emptyTitle="Machine Not Found"
        emptyMessage={`No machine record found for code '${machineCode}'.`}
        onRetry={() => { refetchMachine(); refetchHistory(); }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Spatial Diagnostic Box */}
          <div className="lg:col-span-2 industrial-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center justify-between">
              <span>3D Machine Component Spatial Inspection</span>
              <span className="text-[10px] text-amber-400 font-mono">Component Selected: {selectedComp}</span>
            </h3>

            <div className="h-[380px] w-full">
              <Machine3DViewer machineCode={machineCode} isAnomalyActive={telemetry.vibRMS > 4.5} onSelectComponent={(c) => setSelectedComp(c)} />
            </div>

            {/* Component Health Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sub-Component Telemetry Breakdown</h4>
              {components.length === 0 ? (
                <p className="text-xs text-slate-400 p-2">No sub-components mapped for this machine.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="pb-2">Component Name</th>
                        <th className="pb-2">Vibration RMS</th>
                        <th className="pb-2">Temperature</th>
                        <th className="pb-2">Health Index</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {components.map((comp: any, idx: number) => (
                        <tr
                          key={idx}
                          className={`cursor-pointer transition ${
                            comp.status === 'CRITICAL' ? 'bg-red-950/40 border-l-2 border-red-500' : 'hover:bg-slate-900/60'
                          }`}
                          onClick={() => setSelectedComp(comp.name)}
                        >
                          <td className="py-2.5 font-bold text-white pl-2">{comp.name}</td>
                          <td className="py-2.5 text-slate-200 font-bold">{comp.vibrationRms} mm/s</td>
                          <td className="py-2.5 text-slate-200 font-bold">{comp.temperature} °C</td>
                          <td className={`py-2.5 font-bold ${comp.health < 50 ? 'text-red-400' : comp.health < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {comp.health}%
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                              comp.status === 'CRITICAL'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : comp.status === 'WARNING'
                                ? 'bg-amber-950 text-amber-400'
                                : 'bg-emerald-950 text-emerald-400'
                            }`}>
                              {comp.status || 'HEALTHY'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Specs & Sensor Specs Side Panel */}
          <div className="space-y-6">
            <div className="industrial-card p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Machine Metadata & ERP Sync</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400"><span className="text-slate-400">Manufacturer:</span><span className="text-white font-mono">{machineData?.manufacturer}</span></div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-400">Model:</span><span className="text-white font-mono">{machineData?.model}</span></div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-400">Serial Number:</span><span className="text-white font-mono">{machineData?.serialNumber}</span></div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-400">SAP PM Asset ID:</span><span className="text-emerald-400 font-mono font-bold">{machineData?.erpRef || 'SAP-PM-EQ-10042'}</span></div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-400">Siemens MES Tag:</span><span className="text-emerald-400 font-mono font-bold">{machineData?.mesRef || 'MES-L4-EQ01'}</span></div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-400">OPC-UA Tag:</span><span className="text-emerald-400 font-mono font-bold">{machineData?.scadaRef || 'SCADA-PLC-01'}</span></div>
              </div>
            </div>

            <div className="industrial-card p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">Live Telemetry Trend</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetryHistory}>
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="vib" stroke="#ef4444" strokeWidth={2.5} name="Vibration (mm/s)" dot={false} />
                    <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} name="Temp (°C)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </QueryStateWrapper>
    </div>
  );
};
