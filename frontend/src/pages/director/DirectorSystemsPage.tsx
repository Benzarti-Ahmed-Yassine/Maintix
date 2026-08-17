import React from 'react';
import {
  Server,
  CheckCircle2,
  Cpu,
  Database,
  Radio,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { useDirectorSystems } from '../../hooks/useDirectorData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const DirectorSystemsPage: React.FC = () => {
  const systemsQuery = useDirectorSystems();

  return (
    <QueryStateWrapper query={systemsQuery}>
      {(systems) => {
        const sysList = [
          { name: 'SAP PM / S4HANA ERP', icon: <Database className="text-blue-400" size={24} />, data: systems.sapErp, role: 'Asset Capitalization & CMMS' },
          { name: 'Siemens Opcenter MES', icon: <Share2 className="text-purple-400" size={24} />, data: systems.siemensMes, role: 'Plant Floor Dispatch & OEE' },
          { name: 'SCADA / OPC-UA Gateway', icon: <Radio className="text-amber-400" size={24} />, data: systems.scadaOpcua, role: 'PLC Tag Acquisition' },
          { name: 'Mosquitto MQTT Broker', icon: <Server className="text-teal-400" size={24} />, data: systems.mosquittoMqtt, role: 'Telemetry Transport' },
          { name: 'Prognostics ML Engine', icon: <Cpu className="text-emerald-400" size={24} />, data: systems.mlInferenceEngine, role: 'RUL & Anomaly Inference' },
          { name: 'Validated Local RAG Copilot', icon: <ShieldCheck className="text-cyan-400" size={24} />, data: systems.localRagCopilot, role: 'Industrial Decision Intelligence' },
        ];

        return (
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <span>DIRECTOR SUITE</span>
                  <span>/</span>
                  <span className="text-slate-100">OT/IT SYSTEMS ARCHITECTURE</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                  <Server className="text-amber-400" />
                  Enterprise OT / IT System Architecture & Infrastructure
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status of connected ERP, MES, SCADA, MQTT, and AI inference engines</p>
              </div>
            </div>

            {/* Systems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sysList.map((sys) => (
                <div
                  key={sys.name}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                        {sys.icon}
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                        ● {sys.data?.status || 'CONNECTED'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white">{sys.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{sys.role}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Sync: <strong className="text-emerald-400">{sys.data?.syncStatus || 'OPTIMAL'}</strong></span>
                    <span className="text-slate-400">Latency: <strong className="text-white">{sys.data?.latencyMs || 4}ms</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </QueryStateWrapper>
  );
};
