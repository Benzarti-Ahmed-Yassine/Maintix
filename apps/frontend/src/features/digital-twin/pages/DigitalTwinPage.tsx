import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';

interface ComponentStatus {
  id: string;
  name: string;
  status: 'Normal' | 'Warning' | 'Critical';
  temp: string;
  vibration: string;
  health: number;
}

const COMPONENTS: ComponentStatus[] = [
  { id: 'comp-1', name: 'Main Drive Motor', status: 'Normal', temp: '54.2°C', vibration: '2.1 mm/s', health: 96 },
  { id: 'comp-2', name: 'Bearing Assembly (Left)', status: 'Critical', temp: '82.5°C', vibration: '11.2 mm/s', health: 28 },
  { id: 'comp-3', name: 'Hydraulic Pump', status: 'Normal', temp: '48.0°C', vibration: '1.8 mm/s', health: 92 },
  { id: 'comp-4', name: 'Gearbox Stage 1', status: 'Warning', temp: '66.8°C', vibration: '5.4 mm/s', health: 74 },
  { id: 'comp-5', name: 'Cooling Fan System', status: 'Normal', temp: '38.5°C', vibration: '0.9 mm/s', health: 98 },
];

export function DigitalTwinPage() {
  const [selectedComp, setSelectedComp] = useState<ComponentStatus>(COMPONENTS[1]);

  return (
    <div className="space-y-6">
      <Panel title="Digital Twin" subtitle="Real-time 3D telemetry simulation and machine component health">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* 3D Visualization Canvas Container */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0C1220] p-6 lg:col-span-2 min-h-[480px]">
            {/* Grid & Ambient Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.06),transparent_70%)] pointer-events-none" />

            {/* Header overlay */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Model: TX-1250-A</span>
                <h3 className="text-lg font-bold text-white">Industrial Extruder Line #4</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Twin Sync
              </div>
            </div>

            {/* Interactive Machine Model Diagram */}
            <div className="relative z-10 my-auto flex items-center justify-center py-6">
              <svg viewBox="0 0 600 240" className="w-full max-w-[540px] drop-shadow-2xl">
                {/* Main Machine Chassis */}
                <rect x="80" y="70" width="440" height="110" rx="12" fill="#141E33" stroke="rgba(0,183,255,0.3)" strokeWidth="2" />

                {/* Sub-components with highlight */}
                {/* Motor */}
                <g onClick={() => setSelectedComp(COMPONENTS[0])} className="cursor-pointer transition-all hover:opacity-80">
                  <rect x="100" y="85" width="80" height="80" rx="8" fill="#1E293B" stroke={selectedComp.id === 'comp-1' ? '#00B7FF' : 'rgba(255,255,255,0.2)'} strokeWidth={selectedComp.id === 'comp-1' ? 3 : 1} />
                  <text x="140" y="130" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="600">Motor</text>
                </g>

                {/* Bearing Left - CRITICAL RED */}
                <g onClick={() => setSelectedComp(COMPONENTS[1])} className="cursor-pointer transition-all hover:opacity-80">
                  <circle cx="230" cy="125" r="32" fill="rgba(239,68,68,0.2)" stroke="#EF4444" strokeWidth={selectedComp.id === 'comp-2' ? 3.5 : 2} className="animate-pulse" />
                  <circle cx="230" cy="125" r="14" fill="#EF4444" opacity="0.8" />
                  <text x="230" y="172" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="700">Bearing (Left) ⚠</text>
                </g>

                {/* Hydraulic Pump */}
                <g onClick={() => setSelectedComp(COMPONENTS[2])} className="cursor-pointer transition-all hover:opacity-80">
                  <rect x="290" y="90" width="70" height="70" rx="6" fill="#1E293B" stroke={selectedComp.id === 'comp-3' ? '#00B7FF' : 'rgba(255,255,255,0.2)'} strokeWidth={selectedComp.id === 'comp-3' ? 3 : 1} />
                  <text x="325" y="130" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="600">Pump</text>
                </g>

                {/* Gearbox Stage 1 - WARNING YELLOW */}
                <g onClick={() => setSelectedComp(COMPONENTS[3])} className="cursor-pointer transition-all hover:opacity-80">
                  <rect x="380" y="85" width="65" height="80" rx="6" fill="rgba(234,179,8,0.15)" stroke="#EAB308" strokeWidth={selectedComp.id === 'comp-4' ? 3 : 1.5} />
                  <text x="412" y="130" textAnchor="middle" fill="#EAB308" fontSize="11" fontWeight="600">Gearbox</text>
                </g>

                {/* Cooling Fan */}
                <g onClick={() => setSelectedComp(COMPONENTS[4])} className="cursor-pointer transition-all hover:opacity-80">
                  <circle cx="480" cy="125" r="24" fill="#1E293B" stroke={selectedComp.id === 'comp-5' ? '#00B7FF' : 'rgba(255,255,255,0.2)'} strokeWidth={selectedComp.id === 'comp-5' ? 3 : 1} />
                  <text x="480" y="130" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="600">Fan</text>
                </g>

                {/* Connection lines */}
                <line x1="180" y1="125" x2="198" y2="125" stroke="#00B7FF" strokeWidth="2" strokeDasharray="4 2" />
                <line x1="262" y1="125" x2="290" y2="125" stroke="#00B7FF" strokeWidth="2" strokeDasharray="4 2" />
                <line x1="360" y1="125" x2="380" y2="125" stroke="#00B7FF" strokeWidth="2" strokeDasharray="4 2" />
                <line x1="445" y1="125" x2="456" y2="125" stroke="#00B7FF" strokeWidth="2" strokeDasharray="4 2" />
              </svg>
            </div>

            <div className="relative z-10 text-center text-xs text-slate-400">
              Click any component node above to inspect real-time physical parameters and failure risk models.
            </div>
          </div>

          {/* Component Details Panel */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-maintix-surfaceLight p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white text-base">{selectedComp.name}</h4>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selectedComp.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  selectedComp.status === 'Warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {selectedComp.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Component Health Index</span>
                    <span className="font-semibold text-white">{selectedComp.health}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedComp.health < 40 ? 'bg-red-500' : selectedComp.health < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedComp.health}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Temperature</div>
                    <div className="text-lg font-extrabold text-white mt-1">{selectedComp.temp}</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Vibration</div>
                    <div className="text-lg font-extrabold text-white mt-1">{selectedComp.vibration}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Components List */}
            <div className="flex-1 rounded-3xl border border-white/10 bg-maintix-surfaceLight p-5 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">All Telemetry Nodes</div>
              {COMPONENTS.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComp(comp)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedComp.id === comp.id
                      ? 'border-maintix-primary bg-maintix-primary/10 text-white'
                      : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-medium">{comp.name}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    comp.status === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                    comp.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </button>
              ))}
            </div>
          </div>

        </div>
      </Panel>
    </div>
  );
}
