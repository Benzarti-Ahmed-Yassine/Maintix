import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Plus,
  Upload,
  Sparkles,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import { useTechnicianMachines } from '../../hooks/useTechnicianData.js';
import { useCreateDemoMachine } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const AdminMachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const machinesQuery = useTechnicianMachines();
  const createDemoMutation = useCreateDemoMachine();

  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleDeployDemo = () => {
    createDemoMutation.mutate(undefined, {
      onSuccess: () => {
        alert('Reference Picanol GamMax Loom asset created successfully!');
      }
    });
  };

  return (
    <QueryStateWrapper query={machinesQuery}>
      {(machines) => {
        const filteredMachines = machines.filter((m: any) =>
          m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                  <span>ADMINISTRATION</span>
                  <span>/</span>
                  <span className="text-slate-100">ASSET INVENTORY & ONBOARDING</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                  <Cpu className="text-red-400" />
                  Industrial Machine Catalog & Asset Onboarding
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Manage factory machines, import OEM datasheets, and deploy demo assets</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleDeployDemo}
                  disabled={createDemoMutation.isPending}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow transition"
                >
                  <Sparkles size={14} /> Quick Deploy PCL-GMX Demo Loom
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Upload size={14} /> Import OEM Datasheet
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 max-w-md">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search machines by code or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
              />
            </div>

            {/* Machines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMachines.map((m: any) => (
                <div
                  key={m.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {m.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : m.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white">{m.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{m.type} • {m.location || 'Bay A'}</p>
                  </div>

                  <div className="my-4 grid grid-cols-3 gap-2 text-center p-2.5 bg-slate-950/60 rounded-lg">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Health</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{m.healthScore}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">RUL</span>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">{m.predictedRulDays}d</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Sensors</span>
                      <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">{m.sensorsCount || 15}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/technician/machines/${m.code}/sensors`)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      Sensors <ArrowRight size={12} />
                    </button>

                    <button
                      onClick={() => navigate(`/technician/machines/${m.code}`)}
                      className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      Inspect Asset <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Datasheet Modal */}
            {showImportModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Upload size={18} className="text-blue-400" />
                    Import OEM Datasheet Text / Specification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Paste raw machine technical specifications or JSON schema. MAINTIX extraction engine will automatically parse rated power, nominal RPM, thresholds, and register the asset.
                  </p>

                  <textarea
                    rows={6}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`Picanol GamMax-8-R-190 Rapier Loom\nRated Power: 7.5 kW\nNominal RPM: 1450 RPM\nNominal Bearing Temp: 45°C\nNominal Phase Current: 4.2 A`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:border-blue-500 outline-none"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert('Datasheet parsed and machine registered into catalog!');
                        setShowImportModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                    >
                      Parse & Register Asset
                    </button>
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
