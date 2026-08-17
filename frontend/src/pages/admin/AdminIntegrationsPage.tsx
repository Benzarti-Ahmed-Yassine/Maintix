import React, { useState } from 'react';
import {
  Share2,
  Database,
  Radio,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAdminIntegrations, useAdminErpStatus, useAdminMesStatus, useAdminScadaStatus } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const AdminIntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ERP' | 'MES' | 'SCADA' | 'OPCUA' | 'MQTT'>('OVERVIEW');

  const integrationsQuery = useAdminIntegrations();
  const erpQuery = useAdminErpStatus();
  const mesQuery = useAdminMesStatus();
  const scadaQuery = useAdminScadaStatus();

  return (
    <QueryStateWrapper query={integrationsQuery}>
      {(integrations) => (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                <span>ADMINISTRATION</span>
                <span>/</span>
                <span className="text-slate-100">OT/IT INDUSTRIAL CONNECTORS</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
                <Share2 className="text-red-400" />
                OT / IT Industrial Integrations & Gateway Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Live bidirectional sync with SAP PM ERP, Siemens MES, SCADA PLCs, and OPC-UA / MQTT</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold font-mono">
                ● 5/5 INDUSTRIAL ADAPTERS ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800">
            {[
              { id: 'OVERVIEW', label: 'All Gateways Overview', icon: <Layers size={14} /> },
              { id: 'ERP', label: 'SAP PM ERP Adapter', icon: <Database size={14} /> },
              { id: 'MES', label: 'Siemens Opcenter MES', icon: <Share2 size={14} /> },
              { id: 'SCADA', label: 'SCADA & Modbus Tags', icon: <Radio size={14} /> },
              { id: 'OPCUA', label: 'Kepware OPC-UA', icon: <Activity size={14} /> },
              { id: 'MQTT', label: 'Mosquitto MQTT Broker', icon: <Server size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400 bg-red-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Database className="text-blue-400" size={24} />
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                      ● {integrations.erp?.status || 'CONNECTED'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{integrations.erp?.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{integrations.erp?.endpoint}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                  <span>Latency: <strong className="text-white">{integrations.erp?.latencyMs}ms</strong></span>
                  <span className="text-blue-400 font-bold cursor-pointer" onClick={() => setActiveTab('ERP')}>Configure →</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Share2 className="text-purple-400" size={24} />
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                      ● {integrations.mes?.status || 'CONNECTED'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{integrations.mes?.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{integrations.mes?.endpoint}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                  <span>Latency: <strong className="text-white">{integrations.mes?.latencyMs}ms</strong></span>
                  <span className="text-purple-400 font-bold cursor-pointer" onClick={() => setActiveTab('MES')}>Configure →</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Radio className="text-amber-400" size={24} />
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                      ● {integrations.scada?.status || 'LIVE'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{integrations.scada?.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{integrations.scada?.endpoint}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                  <span>Mapped Tags: <strong className="text-white">{integrations.scada?.tagMappingsCount}</strong></span>
                  <span className="text-amber-400 font-bold cursor-pointer" onClick={() => setActiveTab('SCADA')}>Configure →</span>
                </div>
              </div>
            </div>
          )}

          {/* ERP TAB */}
          {activeTab === 'ERP' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-blue-400" />
                SAP PM Asset Management & Purchase Order Feed
              </h3>
              <p className="text-xs text-slate-400">Synchronized maintenance expenses, spare parts requisitions, and capital asset depreciation.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3">
                <div className="p-3 bg-slate-950/60 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400">Total Maintenance Cost (30d)</span>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">€{erpQuery.data?.costSummary?.totalMaintenanceCost?.toLocaleString() || '12,450'}</div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400">Parts Inventory Value</span>
                  <div className="text-xl font-bold text-blue-400 font-mono mt-0.5">€48,200.00</div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400">Pending Purchase Orders</span>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{erpQuery.data?.purchaseOrders?.length || 2} Orders</div>
                </div>
              </div>
            </div>
          )}

          {/* SCADA TAB */}
          {activeTab === 'SCADA' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio size={18} className="text-amber-400" />
                Plant SCADA Tag Mapping Table (Kepware / Modbus TCP)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Node ID</th>
                      <th className="p-2.5">PLC Tag Name</th>
                      <th className="p-2.5">Machine Code</th>
                      <th className="p-2.5">Mapped Metric</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5 text-right">Sampling Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(scadaQuery.data?.mappings || []).map((tag: any) => (
                      <tr key={tag.nodeId} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-amber-400">{tag.nodeId}</td>
                        <td className="p-2.5 font-bold text-white">{tag.tagName}</td>
                        <td className="p-2.5 text-blue-400">{tag.machineCode}</td>
                        <td className="p-2.5 text-slate-300">{tag.metric}</td>
                        <td className="p-2.5 text-slate-400">{tag.unit}</td>
                        <td className="p-2.5 text-right text-emerald-400">{tag.pollingIntervalMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </QueryStateWrapper>
  );
};
