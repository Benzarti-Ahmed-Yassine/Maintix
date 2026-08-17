import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Box
} from 'lucide-react';
import { useAdminComponents } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const AdminComponentsPage: React.FC = () => {
  const componentsQuery = useAdminComponents();

  return (
    <QueryStateWrapper query={componentsQuery}>
      {(components) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                <span>ADMINISTRATION</span>
                <span>/</span>
                <span className="text-slate-100">SUB-ASSEMBLY & 3D COMPONENTS</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Box className="text-red-400" />
                Component Hierarchy & 3D Spatial Registry
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Machine sub-components, bearings, motors, gearboxes and their spatial coordinates</p>
            </div>
          </div>

          {/* Components Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4">Sub-Assembly Components</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Component Code</th>
                    <th className="p-3">Component Name</th>
                    <th className="p-3">Machine</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Health</th>
                    <th className="p-3">RUL</th>
                    <th className="p-3">3D Coordinate</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {components.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">{c.code}</td>
                      <td className="p-3 text-slate-200 font-sans">{c.name}</td>
                      <td className="p-3 text-blue-400">{c.machine?.code}</td>
                      <td className="p-3 text-slate-400">{c.type}</td>
                      <td className="p-3 font-bold text-emerald-400">{c.health}%</td>
                      <td className="p-3 text-white font-bold">{c.rul || 90}d</td>
                      <td className="p-3 text-slate-400">{c.position3D || '[0, 0, 0]'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400'
                              : c.status === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </QueryStateWrapper>
  );
};
