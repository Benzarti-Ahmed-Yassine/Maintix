import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, Plus, Upload, Search, Trash2, Edit, ArrowRight,
  ChevronRight, X, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { useTechnicianMachines } from '../../hooks/useTechnicianData.js';
import { useAdminProductionLines, useCreateAdminMachine, useDeleteAdminMachine } from '../../hooks/useAdminData.js';
import { QueryStateWrapper } from '../../components/QueryStateWrapper.js';

const MACHINE_TYPES = [
  'Rapier Weaving Loom',
  'Air-Jet Loom',
  'Water-Jet Loom',
  'Spinning Frame',
  'Winding Machine',
  'Warping Machine',
  'Sizing Machine',
  'Compressor',
  'Hydraulic Press',
  'CNC Milling Machine',
  'Conveyor System',
  'Packaging Machine',
  'Industrial Motor',
  'Pump',
  'Other',
];

const CRITICALITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface MachineForm {
  code: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  criticality: string;
  ratedPower: string;
  nominalRPM: string;
  nominalTemperature: string;
  nominalCurrent: string;
  nominalVoltage: string;
  maintenanceInterval: string;
  erpRef: string;
  mesRef: string;
  scadaRef: string;
  description: string;
  productionLineId: string;
}

const DEFAULT_FORM: MachineForm = {
  code: '',
  name: '',
  type: 'Rapier Weaving Loom',
  manufacturer: '',
  model: '',
  serialNumber: '',
  location: '',
  criticality: 'HIGH',
  ratedPower: '7.5',
  nominalRPM: '1450',
  nominalTemperature: '45',
  nominalCurrent: '4.2',
  nominalVoltage: '400',
  maintenanceInterval: '90',
  erpRef: '',
  mesRef: '',
  scadaRef: '',
  description: '',
  productionLineId: '',
};

function getStatusColor(status: string) {
  switch (status) {
    case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'WARNING':  return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'DOWN':     return 'bg-slate-700/40 text-slate-400 border-slate-600/30';
    default:         return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}

function getHIColor(score: number) {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

// Form field component
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition ${className}`}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Datasheet import parser
function parseDatasheet(text: string): Partial<MachineForm> {
  const result: Partial<MachineForm> = {};
  const lines = text.split(/\n|;/);
  for (const line of lines) {
    const lower = line.toLowerCase();
    const val = (line.split(':').slice(1).join(':').trim());
    if (!val) continue;
    if (lower.includes('machine name') || lower.includes('asset name')) result.name = val;
    else if (lower.includes('code') || lower.includes('asset id')) result.code = val.replace(/\s/g, '-').toUpperCase();
    else if (lower.includes('manufacturer')) result.manufacturer = val;
    else if (lower.includes('model')) result.model = val;
    else if (lower.includes('serial')) result.serialNumber = val;
    else if (lower.includes('rated power')) result.ratedPower = val.replace(/[^0-9.]/g, '');
    else if (lower.includes('nominal rpm') || lower.includes('rotation speed')) result.nominalRPM = val.replace(/[^0-9.]/g, '');
    else if (lower.includes('nominal temp') || lower.includes('bearing temp')) result.nominalTemperature = val.replace(/[^0-9.]/g, '');
    else if (lower.includes('nominal current') || lower.includes('phase current')) result.nominalCurrent = val.replace(/[^0-9.]/g, '');
    else if (lower.includes('voltage')) result.nominalVoltage = val.replace(/[^0-9.]/g, '');
    else if (lower.includes('location')) result.location = val;
    else if (lower.includes('description')) result.description = val;
  }
  return result;
}

// Create/Edit Machine Modal
function MachineModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting,
  productionLines,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: MachineForm) => void;
  initialValues?: Partial<MachineForm>;
  isSubmitting: boolean;
  productionLines: any[];
}) {
  const [form, setForm] = useState<MachineForm>({ ...DEFAULT_FORM, ...initialValues });
  const set = (key: keyof MachineForm) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  React.useEffect(() => {
    if (open) setForm({ ...DEFAULT_FORM, ...initialValues });
  }, [open]);

  if (!open) return null;

  const handleImport = () => {
    const parsed = parseDatasheet(importText);
    setForm(f => ({ ...f, ...parsed }));
    setShowImport(false);
    setImportText('');
  };

  const lineOptions = productionLines.map((l: any) => ({ value: l.id, label: l.name || l.lineCode }));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu size={18} className="text-blue-400" />
            {initialValues?.code ? 'Edit Machine' : 'Register New Machine'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(v => !v)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Upload size={13} /> Import from Datasheet
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Datasheet import area */}
        {showImport && (
          <div className="mx-6 mt-4 p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
            <p className="text-xs text-slate-400">
              Paste the machine technical specification. The system will extract fields automatically.
            </p>
            <textarea
              rows={5}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`Machine Name: Picanol OptiMax-i 1250\nManufacturer: Picanol NV\nModel: OptiMax-i 1250\nSerial Number: PCL-2024-1250-A\nRated Power: 7.5 kW\nNominal RPM: 1450 RPM\nNominal Bearing Temp: 45°C\nNominal Phase Current: 4.2 A\nVoltage: 400 V\nLocation: Hall B, Row 3`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:border-blue-500 outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowImport(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition">Cancel</button>
              <button onClick={handleImport} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition">
                Extract & Fill Fields
              </button>
            </div>
          </div>
        )}

        {/* Form body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Identification */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Machine Code" required>
                <Input value={form.code} onChange={set('code')} placeholder="e.g. PCL-OPT-001" />
              </Field>
              <Field label="Machine Name" required>
                <Input value={form.name} onChange={set('name')} placeholder="Picanol OptiMax-i 1250" />
              </Field>
              <Field label="Machine Type" required>
                <Select value={form.type} onChange={set('type')} options={MACHINE_TYPES.map(t => ({ value: t, label: t }))} />
              </Field>
            </div>
          </div>

          {/* Manufacturer */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">Manufacturer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Manufacturer">
                <Input value={form.manufacturer} onChange={set('manufacturer')} placeholder="Picanol NV" />
              </Field>
              <Field label="Model">
                <Input value={form.model} onChange={set('model')} placeholder="OptiMax-i 1250" />
              </Field>
              <Field label="Serial Number">
                <Input value={form.serialNumber} onChange={set('serialNumber')} placeholder="SN-2024-XXXX" />
              </Field>
            </div>
          </div>

          {/* Location & Assignment */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">Location & Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Location">
                <Input value={form.location} onChange={set('location')} placeholder="Hall B, Row 3" />
              </Field>
              <Field label="Production Line" required>
                {lineOptions.length > 0 ? (
                  <Select value={form.productionLineId} onChange={set('productionLineId')} options={[{ value: '', label: 'Select a line…' }, ...lineOptions]} />
                ) : (
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-500 italic">
                    No production lines available
                  </div>
                )}
              </Field>
              <Field label="Criticality">
                <Select value={form.criticality} onChange={set('criticality')} options={CRITICALITY_OPTIONS.map(c => ({ value: c, label: c }))} />
              </Field>
            </div>
          </div>

          {/* Technical Parameters */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">Technical Parameters</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Field label="Rated Power (kW)">
                <Input type="number" value={form.ratedPower} onChange={set('ratedPower')} placeholder="7.5" />
              </Field>
              <Field label="Nominal RPM">
                <Input type="number" value={form.nominalRPM} onChange={set('nominalRPM')} placeholder="1450" />
              </Field>
              <Field label="Nominal Temp (°C)">
                <Input type="number" value={form.nominalTemperature} onChange={set('nominalTemperature')} placeholder="45" />
              </Field>
              <Field label="Nominal Current (A)">
                <Input type="number" value={form.nominalCurrent} onChange={set('nominalCurrent')} placeholder="4.2" />
              </Field>
              <Field label="Voltage (V)">
                <Input type="number" value={form.nominalVoltage} onChange={set('nominalVoltage')} placeholder="400" />
              </Field>
            </div>
          </div>

          {/* System Integration */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">System Integration (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="ERP Ref (SAP PM)">
                <Input value={form.erpRef} onChange={set('erpRef')} placeholder="SAP-PM-EQ-XXXXX" />
              </Field>
              <Field label="MES Tag (Siemens)">
                <Input value={form.mesRef} onChange={set('mesRef')} placeholder="MES-L4-EQ01" />
              </Field>
              <Field label="SCADA / OPC-UA Tag">
                <Input value={form.scadaRef} onChange={set('scadaRef')} placeholder="SCADA-PLC-01" />
              </Field>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Short machine description or operational notes…"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition resize-none"
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={isSubmitting || !form.code || !form.name || !form.productionLineId}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            {initialValues?.code ? 'Save Changes' : 'Register Machine'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation modal
function DeleteModal({ machine, onConfirm, onCancel, isDeleting }: {
  machine: any; onConfirm: () => void; onCancel: () => void; isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-red-900/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-900/30 rounded-lg">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Remove Machine</h3>
            <p className="text-xs text-slate-400">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-xs text-slate-300">
          Are you sure you want to remove <span className="font-bold text-white">{machine?.name}</span> ({machine?.code}) from the asset inventory? All associated sensors, telemetry, and alerts will be deleted.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export const AdminMachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const machinesQuery = useTechnicianMachines();
  const linesQuery = useAdminProductionLines();
  const createMutation = useCreateAdminMachine();
  const deleteMutation = useDeleteAdminMachine();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const productionLines = linesQuery.data || [];

  const handleCreate = (form: MachineForm) => {
    createMutation.mutate({
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      manufacturer: form.manufacturer,
      model: form.model,
      serialNumber: form.serialNumber,
      location: form.location,
      criticality: form.criticality,
      ratedPower: parseFloat(form.ratedPower) || 7.5,
      nominalRPM: parseFloat(form.nominalRPM) || 1450,
      nominalTemperature: parseFloat(form.nominalTemperature) || 45,
      nominalCurrent: parseFloat(form.nominalCurrent) || 4.2,
      nominalVoltage: parseFloat(form.nominalVoltage) || 400,
      maintenanceInterval: parseInt(form.maintenanceInterval) || 90,
      erpRef: form.erpRef || undefined,
      mesRef: form.mesRef || undefined,
      scadaRef: form.scadaRef || undefined,
      description: form.description || undefined,
      productionLineId: form.productionLineId,
      sourceType: 'MANUAL',
    }, {
      onSuccess: (data: any) => {
        setShowCreate(false);
        setSuccessMsg(`Machine ${data.code} registered successfully.`);
        setTimeout(() => setSuccessMsg(null), 4000);
      },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setSuccessMsg(`Machine ${deleteTarget.code} removed from inventory.`);
        setTimeout(() => setSuccessMsg(null), 4000);
      },
    });
  };

  return (
    <QueryStateWrapper query={machinesQuery}>
      {(machines: any[]) => {
        const filtered = machines.filter((m: any) =>
          m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.location || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
            {/* Modals */}
            <MachineModal
              open={showCreate}
              onClose={() => setShowCreate(false)}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
              productionLines={productionLines}
            />
            {deleteTarget && (
              <DeleteModal
                machine={deleteTarget}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                isDeleting={deleteMutation.isPending}
              />
            )}

            {/* Success toast */}
            {successMsg && (
              <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-900 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold">
                <CheckCircle2 size={15} /> {successMsg}
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                  <span>ADMINISTRATION</span><span>/</span>
                  <span className="text-slate-200">ASSET INVENTORY</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  <Cpu className="text-blue-400" />
                  Machine Asset Registry
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {machines.length} machines registered · Register new assets, configure parameters, and manage the inventory
                </p>
              </div>

              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
              >
                <Plus size={15} /> Register Machine
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 max-w-md">
              <Search size={15} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search by code, name, or location…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
              />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-sm">
                {searchTerm ? 'No machines match your search.' : 'No machines registered yet. Click "Register Machine" to add the first asset.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((m: any) => (
                  <div
                    key={m.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {m.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(m.status)}`}>
                          {m.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-white">{m.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {m.type} · {m.location || '—'}
                      </p>
                    </div>

                    <div className="my-4 grid grid-cols-3 gap-2 text-center p-2.5 bg-slate-950/60 rounded-lg">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Health</span>
                        <div className={`text-xs font-bold font-mono mt-0.5 ${getHIColor(m.healthScore ?? 96)}`}>
                          {Math.round(m.healthScore ?? 96)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">RUL</span>
                        <div className="text-xs font-bold text-white font-mono mt-0.5">{m.predictedRulDays ?? 60}d</div>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Sensors</span>
                        <div className="text-xs font-bold text-blue-400 font-mono mt-0.5">{m.sensorsCount ?? 0}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                          title="Remove from inventory"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
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
                          Inspect <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }}
    </QueryStateWrapper>
  );
};
