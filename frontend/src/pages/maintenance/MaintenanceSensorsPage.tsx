import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  Cpu,
  TrendingUp,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Radio,
  Download
} from 'lucide-react';
import { useMaintenanceSensors } from '../../hooks/useMaintenanceData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const MaintenanceSensorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const sensorsQuery = useMaintenanceSensors();

  return (
    <QueryStateWrapper query={sensorsQuery}>
      {({ sensorHealthBreakdown, topVibrationMachines, topTemperatureMachines, correlationData, failureCandidates, allSensors }) => {
        const filteredSensors = filterStatus === 'ALL'
          ? allSensors
          : allSensors.filter((s: any) => s.status === filterStatus);

        return (
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
                  <span>MAINTENANCE PLATFORM</span>
                  <span>/</span>
                  <span>RELIABILITY & PROGNOSTICS</span>
                  <span>/</span>
                  <span className="text-slate-100">FLEET SENSOR ANALYTICS</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                  <Activity className="text-teal-400" />
                  Plant-Wide Sensor Reliability & Analytical Platform
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Continuous signal drift auditing, health scoring, and failure candidate prediction</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.open('http://localhost:4000/api/exports/bi-datasets/sensor_readings/download', '_blank')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> Export Fleet Telemetry
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Total Fleet Sensors</span>
                <div className="text-2xl font-black text-white font-mono mt-1">{sensorHealthBreakdown.total}</div>
                <div className="text-[10px] text-slate-400 mt-1">Across 6 Factory Assets</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Healthy Sensors</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{sensorHealthBreakdown.healthy}</div>
                <div className="text-[10px] text-slate-400 mt-1">Within calibrated drift</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-amber-400 uppercase">Warning Sensors</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">{sensorHealthBreakdown.warning}</div>
                <div className="text-[10px] text-slate-400 mt-1">Approaching upper limit</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-red-400 uppercase">Critical Sensors</span>
                <div className="text-2xl font-black text-red-400 font-mono mt-1">{sensorHealthBreakdown.critical}</div>
                <div className="text-[10px] text-red-400/80 mt-1 font-semibold">Immediate intervention</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Offline Sensors</span>
                <div className="text-2xl font-black text-slate-400 font-mono mt-1">{sensorHealthBreakdown.offline}</div>
                <div className="text-[10px] text-slate-400 mt-1">Zero communication drop</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
                <span className="text-[11px] font-mono text-teal-400 uppercase">Average Signal Quality</span>
                <div className="text-2xl font-black text-teal-400 font-mono mt-1">{sensorHealthBreakdown.avgSignalQuality}%</div>
                <div className="text-[10px] text-slate-400 mt-1">High SNR ratio</div>
              </div>
            </div>

            {/* Fleet Comparison & Ranking Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Vibration Ranking */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      Top Vibration Assets (mm/s RMS)
                    </h3>
                    <p className="text-xs text-slate-400">Fleet vibration severity ranking according to ISO 10816-3</p>
                  </div>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topVibrationMachines}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="machineCode" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 14]} unit=" mm/s" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                      <Bar dataKey="vibRMS" fill="#ef4444" radius={[4, 4, 0, 0]} name="Vib RMS (mm/s)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Temperature Ranking */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      Top Bearing Thermal Signatures (°C)
                    </h3>
                    <p className="text-xs text-slate-400">Highest thermal stress assets across spinning and weaving bays</p>
                  </div>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topTemperatureMachines}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="machineCode" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 80]} unit="°C" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                      <Bar dataKey="tempBearing" fill="#f97316" radius={[4, 4, 0, 0]} name="Bearing Temp (°C)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sensor Failure Candidates List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="text-red-400" size={18} />
                    High-Priority Sensor Failure & Threshold Candidates
                  </h3>
                  <p className="text-xs text-slate-400">Automated sensor quality and threshold breach risk assessment</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sensor Code</th>
                      <th className="p-3">Sensor Name</th>
                      <th className="p-3">Machine</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Signal Quality</th>
                      <th className="p-3">Diagnostic Rationale</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {failureCandidates.map((fc: any) => (
                      <tr key={fc.sensorId} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{fc.sensorCode}</td>
                        <td className="p-3 text-slate-200">{fc.sensorName}</td>
                        <td className="p-3 text-blue-400">{fc.machineCode} ({fc.machineName})</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              fc.status === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {fc.status}
                          </span>
                        </td>
                        <td className="p-3 text-cyan-400">{fc.signalQuality}%</td>
                        <td className="p-3 text-slate-300 font-sans">{fc.reason}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => navigate(`/technician/sensors/${fc.sensorId}`)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-sans font-semibold transition"
                          >
                            Deep Dive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Sensors Master Filterable Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Fleet Sensor Inventory & Calibration Registry</h3>
                  <p className="text-xs text-slate-400">All registered IoT sensors across plant lines</p>
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={13} className="text-slate-400" />
                  {['ALL', 'HEALTHY', 'WARNING', 'CRITICAL'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                        filterStatus === st
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSensors.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/technician/sensors/${s.id}`)}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg hover:border-teal-500/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{s.code}</span>
                        <span className="text-xs font-bold text-white">{s.name}</span>
                      </div>
                      <p className="text-[11px] text-teal-400 font-mono mt-0.5">{s.machineCode} • {s.type}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.status === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : s.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {s.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">{s.signalQuality}% quality</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    </QueryStateWrapper>
  );
};
