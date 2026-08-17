import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Plus, RefreshCw, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useMaintenanceWorkOrders, useUpdateWorkOrder } from '../../hooks/useMaintenanceData.js';
import { useCreateWorkOrder, useTechnicianMachines } from '../../hooks/useTechnicianData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

export const WorkOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: workOrders = [], isLoading, isError, error, refetch } = useMaintenanceWorkOrders();
  const { data: machines = [] } = useTechnicianMachines();
  const createMutation = useCreateWorkOrder();
  const updateMutation = useUpdateWorkOrder();

  const [showModal, setShowModal] = useState(false);
  const [formMachine, setFormMachine] = useState('TX-1250-A');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    createMutation.mutate({
      machineId: formMachine,
      title: formTitle,
      description: formDesc || formTitle,
      priority: formPriority,
    }, {
      onSuccess: () => {
        setShowModal(false);
        setFormTitle('');
        setFormDesc('');
      }
    });
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench size={20} className="text-blue-400" /> Work Orders & Maintenance Interventions
          </h1>
          <p className="text-xs text-slate-400">Manage CMMS work orders, technician assignments, and repair tasks</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
          >
            <Plus size={16} /> Create Work Order
          </button>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && workOrders.length === 0}
        emptyTitle="No Work Orders Found"
        emptyMessage="No work orders are currently logged in the CMMS database. Create a new work order above."
        onRetry={() => refetch()}
      >
        <div className="industrial-card p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3">WO Number</th>
                  <th className="pb-3">Machine</th>
                  <th className="pb-3">Title / Task</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Technician</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {workOrders.map((wo: any) => {
                  const machineCode = wo.machine?.code || wo.machineId || 'TX-1250-A';
                  return (
                    <tr key={wo.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-3 font-bold text-blue-400">{wo.orderNumber || wo.id}</td>
                      <td
                        className="py-3 font-bold text-white hover:underline cursor-pointer"
                        onClick={() => navigate(`/technician/machines/${machineCode}`)}
                      >
                        {machineCode}
                      </td>
                      <td className="py-3 font-sans text-slate-200">{wo.title}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                          wo.priority === 'URGENT'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : wo.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="py-3 font-sans text-slate-300">
                        {wo.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                          wo.status === 'OPEN'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : wo.status === 'IN_PROGRESS'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {typeof wo.createdAt === 'string' ? wo.createdAt.split('T')[0] : 'Recent'}
                      </td>
                      <td className="py-3 text-right">
                        {wo.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateStatus(wo.id, 'IN_PROGRESS')}
                            className="px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded text-[10px] font-sans font-semibold transition"
                          >
                            Start
                          </button>
                        )}
                        {wo.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateStatus(wo.id, 'COMPLETED')}
                            className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded text-[10px] font-sans font-semibold transition"
                          >
                            Complete
                          </button>
                        )}
                        {wo.status === 'COMPLETED' && (
                          <span className="text-[10px] text-slate-500 font-sans font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 size={12} className="text-emerald-400" /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </QueryStateWrapper>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench size={18} className="text-blue-400" /> New Work Order
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Target Machine</label>
                <select
                  value={formMachine}
                  onChange={(e) => setFormMachine(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                >
                  {machines.length > 0 ? (
                    machines.map((m: any) => (
                      <option key={m.code} value={m.code}>
                        {m.code} ({m.name})
                      </option>
                    ))
                  ) : (
                    <option value="TX-1250-A">TX-1250-A (Air-Jet Loom A12)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Intervention Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bearing Replacement & Shaft Alignment"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="URGENT">URGENT (Critical Anomaly)</option>
                  <option value="HIGH">HIGH (Preventive Schedule)</option>
                  <option value="MEDIUM">MEDIUM (Standard Routine)</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detailed instructions or diagnostics details..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Submitting...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
