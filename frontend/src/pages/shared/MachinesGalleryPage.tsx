import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Filter, Cpu, AlertTriangle, CheckCircle2, WifiOff,
  Zap, Thermometer, Activity, Clock, ChevronRight, RefreshCw
} from 'lucide-react';
import { useTechnicianMachines } from '../../hooks/useTechnicianData.js';
import { useAppStore } from '../../store/useStore.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

type StatusFilter = 'ALL' | 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'DOWN';

// Maps machine type to a color gradient for the card background image area
function getMachineImageStyle(type: string, status: string): React.CSSProperties {
  const isCritical = status === 'CRITICAL';
  const isWarning = status === 'WARNING';
  const isDown = status === 'DOWN';

  const baseColors: Record<string, string> = {
    'Rapier Weaving Loom': 'from-blue-950 via-slate-900 to-slate-950',
    'Air-Jet Loom': 'from-indigo-950 via-slate-900 to-slate-950',
    'Spinning Frame': 'from-violet-950 via-slate-900 to-slate-950',
    'Compressor': 'from-teal-950 via-slate-900 to-slate-950',
    'Motor': 'from-cyan-950 via-slate-900 to-slate-950',
    'Pump': 'from-sky-950 via-slate-900 to-slate-950',
  };

  return {};
}

function getMachineIcon(type: string) {
  return <Cpu size={48} className="text-slate-600" />;
}

function getHIColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function getHIBorder(score: number): string {
  if (score >= 70) return 'border-emerald-500/30';
  if (score >= 40) return 'border-amber-500/30';
  return 'border-red-500/40';
}

function getHIGlow(score: number): string {
  if (score >= 70) return '';
  if (score >= 40) return 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]';
  return 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]';
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'CRITICAL':
      return { label: 'Critical', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', dot: 'bg-red-500' };
    case 'WARNING':
      return { label: 'Warning', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-500' };
    case 'DOWN':
      return { label: 'Offline', bg: 'bg-slate-700/40', text: 'text-slate-400', border: 'border-slate-600/40', dot: 'bg-slate-500' };
    default:
      return { label: 'Normal', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' };
  }
}

// Visual health bar component
function HealthBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// Machine image/visual area
function MachineVisual({ machine, status }: { machine: any; status: string }) {
  const isCritical = status === 'CRITICAL';
  const isDown = status === 'DOWN';

  return (
    <div className={`relative w-full h-40 rounded-lg overflow-hidden flex items-center justify-center mb-4 ${
      isCritical
        ? 'bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-950'
        : isDown
        ? 'bg-gradient-to-br from-slate-800/60 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950'
    }`}>
      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      {/* Machine type icon + label */}
      <div className="flex flex-col items-center gap-2 z-10">
        <div className={`p-3 rounded-xl border ${
          isCritical ? 'border-red-800/50 bg-red-950/30' : 'border-slate-700/50 bg-slate-800/40'
        }`}>
          <Cpu size={40} className={isCritical ? 'text-red-400/70' : 'text-blue-400/60'} />
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          {machine.type || 'Industrial Machine'}
        </span>
      </div>
      {/* Critical pulse overlay */}
      {isCritical && (
        <div className="absolute inset-0 border-2 border-red-500/20 rounded-lg animate-pulse" />
      )}
      {/* Offline overlay */}
      {isDown && (
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-lg">
          <WifiOff size={24} className="text-slate-500" />
        </div>
      )}
    </div>
  );
}

// Single machine card
function MachineCard({ machine, role, onClick }: { machine: any; role: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const status = machine.status || 'HEALTHY';
  const hi = Math.round(machine.healthScore ?? 96);
  const statusCfg = getStatusConfig(status);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative cursor-pointer rounded-xl border transition-all duration-300 overflow-hidden group ${
        getHIGlow(hi)
      } ${
        status === 'CRITICAL'
          ? 'border-red-800/50 hover:border-red-500/60 bg-[#0f1018]'
          : status === 'WARNING'
          ? 'border-amber-800/40 hover:border-amber-500/50 bg-[#0f1018]'
          : status === 'DOWN'
          ? 'border-slate-700/40 hover:border-slate-600 bg-[#0c0e16]'
          : 'border-slate-800/60 hover:border-blue-700/40 bg-[#0f1018]'
      }`}
      style={{ transform: hovered ? 'translateY(-3px)' : 'translateY(0)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
    >
      {/* Card body */}
      <div className="p-4">
        {/* Top row: name + status badge */}
        <div className="flex items-start justify-between mb-1 gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot} ${status === 'CRITICAL' ? 'animate-pulse' : ''}`} />
              <h3 className="text-sm font-bold text-white truncate">{machine.name}</h3>
            </div>
            <p className="text-[10px] font-mono text-slate-500 truncate pl-3">
              {machine.code}
            </p>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Location */}
        <p className="text-[10px] text-slate-500 mb-3 pl-3 truncate">{machine.location || 'Bay A'}</p>

        {/* Machine visual */}
        <MachineVisual machine={machine} status={status} />

        {/* HI indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Health Index</span>
          <span className={`text-sm font-black font-mono ${getHIColor(hi)}`}>
            HI={hi}
          </span>
        </div>
        <HealthBar score={hi} />

        {/* Metrics row */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-900/70 rounded-lg p-2 border border-slate-800/60">
            <p className="text-[9px] text-slate-500 uppercase font-mono mb-0.5">RUL</p>
            <p className={`text-xs font-bold font-mono ${hi < 40 ? 'text-red-400' : hi < 70 ? 'text-amber-400' : 'text-white'}`}>
              {machine.predictedRulDays ?? 60}d
            </p>
          </div>
          <div className="bg-slate-900/70 rounded-lg p-2 border border-slate-800/60">
            <p className="text-[9px] text-slate-500 uppercase font-mono mb-0.5">Alerts</p>
            <p className={`text-xs font-bold font-mono ${(machine.activeAlertsCount ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {machine.activeAlertsCount ?? 0}
            </p>
          </div>
          <div className="bg-slate-900/70 rounded-lg p-2 border border-slate-800/60">
            <p className="text-[9px] text-slate-500 uppercase font-mono mb-0.5">Sensors</p>
            <p className="text-xs font-bold font-mono text-blue-400">{machine.sensorsCount ?? 0}</p>
          </div>
        </div>

        {/* Hover overlay with quick action */}
        <div className={`mt-3 flex items-center justify-between transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[10px] text-slate-400">View full diagnostics</span>
          <ChevronRight size={14} className="text-blue-400" />
        </div>
      </div>
    </div>
  );
}

export const MachinesGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { liveConnected } = useAppStore();

  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  const machinesQuery = useTechnicianMachines();

  // Determine current role from URL path
  const role = location.pathname.startsWith('/maintenance')
    ? 'maintenance'
    : location.pathname.startsWith('/production')
    ? 'production'
    : location.pathname.startsWith('/director')
    ? 'director'
    : 'technician';

  const machines: any[] = machinesQuery.data || [];

  const filtered = useMemo(() => {
    return machines.filter((m) => {
      const matchStatus = filter === 'ALL' || m.status === filter;
      const term = search.toLowerCase();
      const matchSearch = !term
        || m.name?.toLowerCase().includes(term)
        || m.code?.toLowerCase().includes(term)
        || m.location?.toLowerCase().includes(term)
        || m.type?.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [machines, filter, search]);

  const counts = useMemo(() => ({
    all: machines.length,
    critical: machines.filter(m => m.status === 'CRITICAL').length,
    warning: machines.filter(m => m.status === 'WARNING').length,
    healthy: machines.filter(m => m.status === 'HEALTHY').length,
    down: machines.filter(m => m.status === 'DOWN').length,
  }), [machines]);

  const filters: { key: StatusFilter; label: string; count: number; color: string }[] = [
    { key: 'ALL', label: 'All', count: counts.all, color: 'bg-blue-600 text-white' },
    { key: 'CRITICAL', label: 'Critical', count: counts.critical, color: 'bg-red-600 text-white' },
    { key: 'WARNING', label: 'Warning', count: counts.warning, color: 'bg-amber-500 text-white' },
    { key: 'HEALTHY', label: 'Normal', count: counts.healthy, color: 'bg-emerald-600 text-white' },
    { key: 'DOWN', label: 'Offline', count: counts.down, color: 'bg-slate-600 text-white' },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Cpu size={20} className="text-blue-400" />
            Asset Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {counts.all} machines registered ·{' '}
            <span className={`font-semibold ${liveConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {liveConnected ? '● Live monitoring' : '● Cached data'}
            </span>
          </p>
        </div>

        <button
          onClick={() => machinesQuery.refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
        >
          <RefreshCw size={13} className={machinesQuery.isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter bar + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={13} className="text-slate-500 mr-1" />
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                filter === f.key
                  ? f.color + ' border-transparent shadow-md scale-105'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`text-[9px] px-1 rounded-sm ${filter === f.key ? 'bg-white/20' : 'bg-slate-700'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex-1 max-w-sm">
          <Search size={13} className="text-slate-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, code, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
          />
        </div>
      </div>

      {/* Grid */}
      <QueryStateWrapper
        isLoading={machinesQuery.isLoading}
        isError={machinesQuery.isError}
        error={machinesQuery.error}
        isEmpty={!machinesQuery.isLoading && !machinesQuery.isError && filtered.length === 0}
        emptyTitle="No machines found"
        emptyMessage={search || filter !== 'ALL' ? 'Try adjusting your filters or search term.' : 'No machines are registered yet. Add machines from the Admin panel.'}
        onRetry={() => machinesQuery.refetch()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((machine: any, idx: number) => (
            <div
              key={machine.id}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="animate-fadeIn"
            >
              <MachineCard
                machine={machine}
                role={role}
                onClick={() => navigate(`/${role}/machines/${machine.code}`)}
              />
            </div>
          ))}
        </div>
      </QueryStateWrapper>
    </div>
  );
};
