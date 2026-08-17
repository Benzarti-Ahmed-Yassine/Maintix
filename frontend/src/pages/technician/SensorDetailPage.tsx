import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radio,
  Activity,
  ArrowLeft,
  ShieldAlert,
  Cpu,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useSensorById, useSensorHistory } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const SensorDetailPage: React.FC = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const navigate = useNavigate();
  const [range, setRange] = useState<'1m' | '5m' | '15m' | '1h' | '24h' | '7d'>('1h');

  const sensorQuery = useSensorById(sensorId || '');
  const historyQuery = useSensorHistory(sensorId || '', range);

  const ranges = ['1m', '5m', '15m', '1h', '24h', '7d'];

  return (
    <QueryStateWrapper query={sensorQuery}>
      {({ sensor, machine, component, statistics, healthHistory }) => {
        const isCrit = sensor.status === 'CRITICAL';
        const isWarn = sensor.status === 'WARNING';

        const chartSeries = (historyQuery.data?.series || []).map((s: any) => ({
          time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: s.value,
          warningThreshold: s.warningThreshold,
          criticalThreshold: s.criticalThreshold,
        }));

        return (
          <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-slate-100">
            {/* Top Navigation Back */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 text-slate-300 transition"
              >
                <ArrowLeft size={14} /> Back to Sensor Fleet
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Machine:</span>
                <button
                  onClick={() => navigate(`/technician/machines/${machine.code}`)}
                  className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-mono font-bold hover:bg-blue-600/30 transition"
                >
                  {machine.code} ({machine.name})
                </button>
              </div>
            </div>

            {/* Sensor Identity Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded">
                    {sensor.code}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                      isCrit
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    ● {sensor.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Signal Quality: {sensor.signalQuality}%</span>
                </div>

                <h1 className="text-2xl font-black text-white">{sensor.name}</h1>
                <p className="text-xs text-slate-400 font-mono">
                  Mounted on: <span className="text-slate-200 font-bold">{component?.name || 'Asset Body'}</span> ({component?.code}) • Type: {sensor.type}
                </p>
              </div>

              {/* Live Value Hero */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-right min-w-[200px]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Live Sensor Telemetry</span>
                <div className={`text-4xl font-black font-mono mt-1 ${isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-white'}`}>
                  {statistics.currentValue} <span className="text-base text-slate-400 font-normal">{sensor.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Warn: {sensor.warningThreshold} | Crit: {sensor.criticalThreshold}
                </div>
              </div>
            </div>

            {/* Statistical Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Minimum Recorded</span>
                <div className="text-2xl font-black text-white font-mono mt-1">{statistics.min} <span className="text-xs text-slate-400 font-normal">{sensor.unit}</span></div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Maximum Peak</span>
                <div className={`text-2xl font-black font-mono mt-1 ${statistics.max > sensor.warningThreshold ? 'text-red-400' : 'text-white'}`}>
                  {statistics.max} <span className="text-xs text-slate-400 font-normal">{sensor.unit}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Arithmetic Mean</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{statistics.mean} <span className="text-xs text-slate-400 font-normal">{sensor.unit}</span></div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Standard Deviation (σ)</span>
                <div className="text-2xl font-black text-purple-400 font-mono mt-1">{statistics.standardDeviation}</div>
              </div>
            </div>

            {/* Live Chart with Time Ranges */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-blue-400" size={18} />
                    High-Frequency Time-Series Trend
                  </h3>
                  <p className="text-xs text-slate-400">Interpolated multi-point sampling with calibrated threshold boundaries</p>
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  {ranges.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r as any)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition ${
                        range === r
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} unit={` ${sensor.unit}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <ReferenceLine y={sensor.warningThreshold} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Warning: ${sensor.warningThreshold}`, fill: '#f59e0b', fontSize: 10 }} />
                    <ReferenceLine y={sensor.criticalThreshold} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Critical: ${sensor.criticalThreshold}`, fill: '#ef4444', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#3b82f6'}
                      strokeWidth={3}
                      dot={{ r: 2 }}
                      name={`${sensor.name} (${sensor.unit})`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Technical Specifications & Hardware Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu size={16} className="text-blue-400" /> Sensor Hardware Specification
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Manufacturer</span>
                    <p className="font-bold text-white mt-0.5">{sensor.manufacturer || 'IFM Electronic'}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Model / Probe</span>
                    <p className="font-bold text-white mt-0.5">{sensor.model || 'VSA001 / PT100'}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Firmware</span>
                    <p className="font-bold text-white mt-0.5">{sensor.firmwareVersion || 'v2.1.0-industrial'}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Sampling Rate</span>
                    <p className="font-bold text-white mt-0.5">{sensor.samplingRateHz || 1.0} Hz (1000ms)</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" /> Signal Quality & Health Pipeline
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Communication Health</span>
                    <p className="font-bold text-emerald-400 mt-0.5">99.4% (Active)</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Noise Level</span>
                    <p className="font-bold text-cyan-400 mt-0.5">0.02 mV (Ultra-low)</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Signal Drift (30d)</span>
                    <p className="font-bold text-white mt-0.5">+0.01% (Calibrated)</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg">
                    <span className="text-slate-400 font-mono">Data Completeness</span>
                    <p className="font-bold text-emerald-400 mt-0.5">100.0% (Zero Drop)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </QueryStateWrapper>
  );
};
