import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Sliders,
  Maximize2
} from 'lucide-react';
import { useMachineSensors, useMachineTelemetryHistory } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

export const TechnicianSensorsPage: React.FC = () => {
  const { machineId } = useParams<{ machineId?: string }>();
  const activeMachineCode = machineId || 'PCL-GMX-001';
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h' | '24h' | '7d'>('1h');
  const [selectedSensorCategory, setSelectedSensorCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'GRID' | 'CHARTS' | 'COMPARISON' | 'TIMELINE'>('CHARTS');

  const sensorsQuery = useMachineSensors(activeMachineCode);
  const telemetryHistoryQuery = useMachineTelemetryHistory(activeMachineCode, 30);

  const ranges = ['1m', '5m', '15m', '1h', '24h', '7d'];
  const categories = ['ALL', 'VIBRATION', 'TEMPERATURE', 'CURRENT', 'SPEED', 'PRESSURE', 'ENV'];

  const telemetryData = telemetryHistoryQuery.data || [];
  const chartData = telemetryData.map((t: any) => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    vibRMS: t.vibRMS,
    tempBearing: t.tempBearing,
    tempMotor: t.tempMotor,
    current: t.current,
    speedRpm: t.speedRpm,
    torque: t.torque || 19.2,
    healthIndex: t.healthIndex,
  }));

  const handleExportCSV = () => {
    window.open(`http://localhost:4000/api/exports/bi-datasets/sensor_readings/download`, '_blank');
  };

  return (
    <QueryStateWrapper query={sensorsQuery}>
      {({ summary, sensors, machineCode, machineName }) => {
        const filteredSensors = selectedSensorCategory === 'ALL'
          ? sensors
          : sensors.filter((s: any) => s.type.includes(selectedSensorCategory) || (selectedSensorCategory === 'ENV' && (s.type === 'HUMIDITY' || s.type === 'DUST')));

        return (
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
            {/* Header Breadcrumbs & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
                  <span>PLANT FLOOR</span>
                  <span>/</span>
                  <span className="cursor-pointer hover:underline" onClick={() => navigate('/technician/machines')}>
                    MACHINES
                  </span>
                  <span>/</span>
                  <span className="text-slate-300 font-bold">{machineCode}</span>
                  <span>/</span>
                  <span className="text-slate-100">LIVE SENSOR TELEMETRY</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                  <Activity className="text-blue-400" />
                  {machineCode} — Comprehensive Sensor Intelligence
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{machineName} • Multi-Signal High-Frequency IoT Stream</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Time Range Selector */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  {ranges.map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r as any)}
                      className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition ${
                        timeRange === r
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> Export CSV
                </button>

                <button
                  onClick={() => sensorsQuery.refetch()}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition"
                  title="Refresh Telemetry"
                >
                  <RefreshCw size={14} className={sensorsQuery.isFetching ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Total Sensors</span>
                <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalSensors}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Continuous Ingestion
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Online & Nominal</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{summary.online}</div>
                <div className="text-[10px] text-slate-400 mt-1">100% Operational</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-amber-400 uppercase">Warning Threshold</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">{summary.warning}</div>
                <div className="text-[10px] text-slate-400 mt-1">Approaching limits</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-red-400 uppercase">Critical Breach</span>
                <div className="text-2xl font-black text-red-400 font-mono mt-1">{summary.critical}</div>
                <div className="text-[10px] text-red-400/80 mt-1 font-semibold">Immediate Action</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Signal Quality</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{summary.avgSignalQuality}%</div>
                <div className="text-[10px] text-slate-400 mt-1">Low noise jitter</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Sampling Rate</span>
                <div className="text-2xl font-black text-purple-400 font-mono mt-1">{summary.samplingRateHz} Hz</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">1 sample/sec</div>
              </div>
            </div>

            {/* Navigation Tabs (Live Charts, Live Grid, Comparison, Synchronized Timeline) */}
            <div className="flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                {[
                  { id: 'CHARTS', label: 'Real-Time Multi-Charts', icon: <TrendingUp size={15} /> },
                  { id: 'GRID', label: 'Live Sensor Grid', icon: <Radio size={15} /> },
                  { id: 'COMPARISON', label: 'Multi-Sensor Correlation', icon: <Sliders size={15} /> },
                  { id: 'TIMELINE', label: 'Synchronized Event Timeline', icon: <Clock size={15} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 pb-2">
                <Filter size={13} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-mono">Filter:</span>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedSensorCategory(c)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                      selectedSensorCategory === c
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: REAL-TIME MULTI-CHARTS */}
            {activeTab === 'CHARTS' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. Vibration Dynamics (RMS & Peak) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                        Vibration RMS & Peak Dynamics (ISO 10816-3)
                      </h3>
                      <p className="text-[11px] text-slate-400">Left Main Shaft Bearing • Critical Threshold: 4.5 mm/s RMS</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                      ZONE D BREACH
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 15]} unit=" mm/s" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                        <ReferenceLine y={4.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warning 4.5', fill: '#f59e0b', fontSize: 10 }} />
                        <ReferenceLine y={7.1} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Danger 7.1', fill: '#ef4444', fontSize: 10 }} />
                        <Area type="monotone" dataKey="vibRMS" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#vibGrad)" name="Vib RMS (mm/s)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Thermal Signature (Bearing vs Motor) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        Thermal Signatures: Bearing vs Motor Surface
                      </h3>
                      <p className="text-[11px] text-slate-400">Continuous thermal profile • Bearing limit: 55.0°C</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded">
                      62.5 °C (ELEVATED)
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[20, 80]} unit="°C" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                        <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Limit 55°C', fill: '#f59e0b', fontSize: 10 }} />
                        <Line type="monotone" dataKey="tempBearing" stroke="#f97316" strokeWidth={2.5} dot={false} name="Bearing Temp (°C)" />
                        <Line type="monotone" dataKey="tempMotor" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Motor Temp (°C)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Electrical Current Draw & Power */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                        Electrical Current & Active Power Load
                      </h3>
                      <p className="text-[11px] text-slate-400">7.5 kW Servo Inverter feed • Nominal: 4.2 A</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      NOMINAL (4.4 A)
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 8]} unit=" A" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                        <ReferenceLine y={6.0} stroke="#f59e0b" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="current" stroke="#06b6d4" strokeWidth={2} dot={false} name="Current (A)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Kinematic Rotation Speed (RPM) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                        Drive Shaft Speed & Torque Stability
                      </h3>
                      <p className="text-[11px] text-slate-400">Nominal 1450 RPM • Picks/min 680</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
                      1450 RPM
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[1200, 1600]} unit=" RPM" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="speedRpm" stroke="#a855f7" strokeWidth={2} dot={false} name="Speed (RPM)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE SENSOR GRID */}
            {activeTab === 'GRID' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSensors.map((sensor: any) => {
                  const isCrit = sensor.status === 'CRITICAL';
                  const isWarn = sensor.status === 'WARNING';
                  const borderColor = isCrit ? 'border-red-500/40 bg-red-950/10' : isWarn ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800 bg-slate-900';

                  return (
                    <div
                      key={sensor.id}
                      onClick={() => navigate(`/technician/sensors/${sensor.id}`)}
                      className={`p-4 rounded-xl border ${borderColor} hover:border-blue-500/60 cursor-pointer transition shadow group flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {sensor.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCrit
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : isWarn
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {sensor.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition">{sensor.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{sensor.componentName}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between">
                        <div>
                          <div className="text-2xl font-black font-mono text-white">
                            {sensor.value} <span className="text-xs text-slate-400 font-normal">{sensor.unit}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Warn: {sensor.warningThreshold} | Crit: {sensor.criticalThreshold}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-blue-400 font-bold group-hover:translate-x-1 transition">
                          Inspect <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: MULTI-SENSOR COMPARISON */}
            {activeTab === 'COMPARISON' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-base font-bold text-white mb-2">Cross-Sensor Correlation: Vibration vs Bearing Temperature</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Demonstrating direct physical coupling between mechanical bearing spalling (11.2 mm/s RMS) and friction-induced thermal rise (62.5°C).
                  </p>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" stroke="#ef4444" domain={[0, 15]} unit=" mm/s" />
                        <YAxis yAxisId="right" orientation="right" stroke="#f97316" domain={[20, 80]} unit="°C" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                        <Line yAxisId="left" type="monotone" dataKey="vibRMS" stroke="#ef4444" strokeWidth={3} dot={false} name="Vib RMS (mm/s)" />
                        <Line yAxisId="right" type="monotone" dataKey="tempBearing" stroke="#f97316" strokeWidth={3} dot={false} name="Bearing Temp (°C)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white mb-1">Vibration vs Shaft RPM Correlation</h4>
                    <p className="text-[11px] text-slate-400 mb-3">Vibration harmonic frequency matches 1X rotational speed (24.1 Hz at 1450 RPM).</p>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[0, 15]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }} />
                          <Line type="monotone" dataKey="vibRMS" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white mb-1">Current Draw vs Drive Torque</h4>
                    <p className="text-[11px] text-slate-400 mb-3">Slight mechanical resistance produces +0.4A transient current elevation.</p>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[0, 8]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }} />
                          <Line type="monotone" dataKey="current" stroke="#06b6d4" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SYNCHRONIZED TIMELINE */}
            {activeTab === 'TIMELINE' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-white">Synchronized Telemetry, Anomaly & Maintenance Event Stream</h3>
                <p className="text-xs text-slate-400">Chronological correlation of sensor telemetry spikes, alarm triggers, and ML model inference.</p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-red-950/20 border-l-4 border-red-500 rounded-r-lg flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase">10:24:15 AM • ALM-VIB-1024 Triggered</span>
                      <h4 className="font-bold text-sm text-white mt-0.5">Vibration RMS Exceeded Critical Zone D (11.2 mm/s RMS)</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Sensor SENS-VIB-01 on Left Bearing confirmed outer-race pitting. Health Score dropped to 22.0%, RUL updated to 18 days.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400">CRITICAL</span>
                  </div>

                  <div className="p-3.5 bg-orange-950/20 border-l-4 border-orange-500 rounded-r-lg flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">10:22:04 AM • ALM-TMP-1022 Triggered</span>
                      <h4 className="font-bold text-sm text-white mt-0.5">Left Bearing Thermal Rise Exceeded 55.0°C (62.5°C recorded)</h4>
                      <p className="text-xs text-slate-300 mt-1">Correlated with vibration surge. AI recommended bearing lubrication & replacement.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-400">HIGH</span>
                  </div>

                  <div className="p-3.5 bg-slate-800/40 border-l-4 border-blue-500 rounded-r-lg flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">09:45:00 AM • Production Shift Shift 1</span>
                      <h4 className="font-bold text-sm text-white mt-0.5">Nominal Baseline Telemetry (1.4 mm/s RMS, 42.0°C)</h4>
                      <p className="text-xs text-slate-300 mt-1">Asset operating within ISO 10816-3 nominal envelope.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">NORMAL</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </QueryStateWrapper>
  );
};
